// Category Models - Based on Real Route E-commerce API Response
// Following the same pattern as product.model.ts
// Updated: 2025-09-29

/**
 * Category Interface - Matches API Response Structure
 * Based on real API response: GET /api/v1/categories/{id}
 */
export interface Category {
  _id: string;                          // Category ID
  name: string;                         // Category name
  slug: string;                         // URL slug
  image: string;                        // Category image URL
  createdAt: string;                    // Creation timestamp
  updatedAt: string;                    // Last update timestamp
}

/**
 * SubCategory Interface - Matches API Response Structure
 * Based on real API response: GET /api/v1/subcategories/{id}
 */
export interface SubCategory {
  _id: string;                          // Subcategory ID
  name: string;                         // Subcategory name
  slug: string;                         // URL slug
  category: string;                     // Parent category ID
  createdAt?: string;                   // Creation timestamp (optional in some responses)
  updatedAt?: string;                   // Last update timestamp (optional in some responses)
}

/**
 * Category Query Parameters for API requests
 * Based on real API testing: GET /api/v1/categories
 */
export interface CategoryQueryParams {
  limit?: number;                       // Items per page (default: 20)
  page?: number;                        // Page number (1-based)
  keyword?: string;                     // Search keyword
}

/**
 * SubCategory Query Parameters
 */
export interface SubCategoryQueryParams {
  limit?: number;                       // Items per page
  page?: number;                        // Page number
  category?: string;                    // Filter by parent category ID
}

/**
 * Category Card Display Interface
 * Simplified version for UI display components
 */
export interface CategoryCardData {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount?: number;                // Optional: number of products in category
}

/**
 * Category Details Extended Interface
 * For category detail pages with additional computed properties
 */
export interface CategoryDetails extends Category {
  subcategories?: SubCategory[];        // Child subcategories
  productCount?: number;                // Number of products in category
}

/**
 * Category with Products Count
 * For category listings that show product counts
 */
export interface CategoryWithCount extends Category {
  productCount: number;
}

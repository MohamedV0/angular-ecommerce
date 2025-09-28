// Product Models - Based on Real Route E-commerce API Response
// Updated: 2025-01-27 - Pure Products Domain (Categories/Brands imported from their domains)

/**
 * Product Interface - Matches API Response Structure
 * Based on real API response: GET /api/v1/products/{id}
 */
export interface Product {
  _id: string;                          // Product ID
  title: string;                        // Product name
  slug: string;                         // URL slug
  description: string;                  // Product description
  quantity: number;                     // Available quantity
  price: number;                        // Current price in EGP
  priceAfterDiscount?: number;          // Discounted price (optional)
  sold: number;                         // Number of units sold
  imageCover: string;                   // Main product image URL
  images: string[];                     // Additional product images
  ratingsAverage: number;               // Average rating (1-5)
  ratingsQuantity: number;              // Number of ratings
  category: CategoryReference;          // Product category (imported from categories domain)
  brand: BrandReference;                // Product brand (imported from brands domain)
  subcategory: SubcategoryReference[];  // Product subcategories
  createdAt: string;                    // Creation timestamp
  updatedAt: string;                    // Last update timestamp
  id?: string;                          // Alternative ID field (sometimes present)
}

/**
 * Category Reference (embedded in Product) - Will import from categories domain
 * Note: These are simplified references for product use
 */
export interface CategoryReference {
  _id: string;
  name: string;
  slug: string;
  image: string;
}

/**
 * Brand Reference (embedded in Product) - Will import from brands domain
 * Note: These are simplified references for product use
 */
export interface BrandReference {
  _id: string;
  name: string;
  slug: string;
  image: string;
}

/**
 * Subcategory Reference (embedded in Product)
 */
export interface SubcategoryReference {
  _id: string;
  name: string;
  slug: string;
  category: string;                     // Parent category ID
}

/**
 * Product Query Parameters for API requests
 * Based on real API testing: GET /api/v1/products
 */
export interface ProductQueryParams {
  limit?: number;                       // Items per page (default: 20)
  page?: number;                        // Page number (1-based)
  sort?: string;                        // Sort field (e.g., "-price", "createdAt", "-ratingsAverage")
  fields?: string;                      // Field selection (comma-separated)
  keyword?: string;                     // Search keyword
  'price[gte]'?: number;               // Price greater than or equal
  'price[lte]'?: number;               // Price less than or equal
  brand?: string;                       // Brand ID filter
  'category[in]'?: string[];           // Category IDs filter (array)
}

/**
 * Product Card Display Interface
 * Simplified version for UI display components
 */
export interface ProductCardData {
  id: string;
  title: string;
  price: number;
  priceAfterDiscount?: number;
  image: string;
  rating: number;
  ratingCount: number;
  brand?: string;
  category?: string;
  isInWishlist?: boolean;
}

/**
 * Product Details Extended Interface
 * For product detail pages with additional computed properties
 */
export interface ProductDetails extends Product {
  // Computed properties
  discountPercentage?: number;
  isOnSale?: boolean;
  isInStock?: boolean;
  relatedProducts?: Product[];
}

/**
 * Product Filter Options
 * For product filtering UI components
 */
export interface ProductFilters {
  categories: string[];                 // Selected category IDs
  brands: string[];                     // Selected brand IDs
  priceRange: {
    min: number;
    max: number;
  };
  rating: number;                       // Minimum rating
  inStock: boolean;                     // Only show in-stock items
  onSale: boolean;                      // Only show discounted items
}

/**
 * Product Search Result Interface
 * For search functionality
 */
export interface ProductSearchResult {
  query: string;
  products: Product[];
  totalResults: number;
  filters: ProductFilters;
  sortBy: string;
}

/**
 * Product Sort Options
 * Shared sorting options for product list and search components
 */
export const PRODUCT_SORT_OPTIONS = [
  { label: 'Newest First', value: '-createdAt' },
  { label: 'Oldest First', value: 'createdAt' },
  { label: 'Price: Low to High', value: 'price' },
  { label: 'Price: High to Low', value: '-price' },
  { label: 'Highest Rated', value: '-ratingsAverage' },
  { label: 'Most Popular', value: '-sold' }
] as const;

/**
 * Search-specific sort options (includes relevance)
 */
export const SEARCH_SORT_OPTIONS = [
  { label: 'Best Match', value: 'relevance' },
  ...PRODUCT_SORT_OPTIONS
] as const;

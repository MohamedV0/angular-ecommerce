import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';

// PrimeNG Components
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

// Feature Imports
import { ProductsService } from '../../services/products';
import { Product, ProductQueryParams } from '../../models/product.model';
import { ProductCard } from '../../../../shared/components/product-card/product-card';
import { PRODUCT_SORT_OPTIONS } from '../../constants/product-sort-options.const';
import { CategoriesService } from '../../../categories/services/categories';
import { Category } from '../../../categories/models/category.model';

/**
 * ProductList Component
 * Main product listing page with pagination, search, and sorting
 * Uses real API data from ProductsService
 */
@Component({
  selector: 'app-product-list',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    // PrimeNG
    PaginatorModule,
    SkeletonModule,
    MessageModule,
    SelectModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    IconFieldModule,
    InputIconModule,
    // Shared
    ProductCard
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss'
})
export class ProductListComponent implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Component state
  readonly products = signal<Product[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string>('');
  readonly totalProducts = signal(0);
  readonly currentPage = signal(1);
  readonly itemsPerPage = signal(30);

  // Search and filters
  readonly searchQuery = signal('');
  readonly sortBy = signal('-createdAt'); // Default to newest first
  readonly categoryFilter = signal<string[]>([]); // Category filter from route
  readonly searchControl = new FormControl('');

  // Categories for dropdown
  readonly categories = signal<Category[]>([]);
  readonly categoriesLoading = signal(false);

  // Sort options
  readonly sortOptions = [...PRODUCT_SORT_OPTIONS];

  // Computed properties
  readonly totalPages = computed(() => 
    Math.ceil(this.totalProducts() / this.itemsPerPage())
  );

  readonly hasProducts = computed(() => this.products().length > 0);
  readonly isFirstPage = computed(() => this.currentPage() === 1);
  readonly isLastPage = computed(() => this.currentPage() >= this.totalPages());
  
  // Get selected category name for display in product count
  readonly selectedCategoryName = computed(() => {
    if (this.categoryFilter().length === 0) return '';
    const categoryId = this.categoryFilter()[0];
    const category = this.categories().find(c => c._id === categoryId);
    return category?.name || 'selected category';
  });

  ngOnInit(): void {
    this.loadCategories();
    this.initializeFromRoute();
    this.setupSearchControl();
  }

  /**
   * Initialize component state from route parameters
   */
  private initializeFromRoute(): void {
    this.route.queryParams.subscribe(params => {
      // Update search query
      if (params['search']) {
        this.searchQuery.set(params['search']);
        this.searchControl.setValue(params['search'], { emitEvent: false });
      } else {
        this.searchQuery.set('');
        this.searchControl.setValue('', { emitEvent: false });
      }
      
      // Update page
      if (params['page']) {
        this.currentPage.set(+params['page']);
      } else {
        this.currentPage.set(1);
      }
      
      // Update sort
      if (params['sort']) {
        this.sortBy.set(params['sort']);
      } else {
        this.sortBy.set('-createdAt');
      }
      
      // Handle category filter from route (when coming from category details)
      if (params['category[in]']) {
        const categoryParam = params['category[in]'];
        const categories = Array.isArray(categoryParam) ? categoryParam : [categoryParam];
        this.categoryFilter.set(categories);
      } else {
        this.categoryFilter.set([]);
      }
      
      // Load products whenever route params change
      this.loadProducts();
    });
  }

  /**
   * Setup search control with debounce
   */
  private setupSearchControl(): void {
    this.searchControl.valueChanges.subscribe(value => {
      if (value !== this.searchQuery()) {
        this.searchQuery.set(value || '');
        this.currentPage.set(1); // Reset to first page on search
        this.updateRoute();
        this.loadProducts();
      }
    });
  }

  /**
   * Load categories for dropdown filter
   */
  loadCategories(): void {
    this.categoriesLoading.set(true);
    
    this.categoriesService.getCategories({ limit: 100 }).subscribe({
      next: (response) => {
        this.categories.set(response.data);
        this.categoriesLoading.set(false);
      },
      error: (error) => {
        console.error('Categories loading error:', error);
        this.categoriesLoading.set(false);
      }
    });
  }

  /**
   * Load products from API
   */
  loadProducts(): void {
    this.loading.set(true);
    this.error.set('');

    const params: ProductQueryParams = {
      page: this.currentPage(),
      limit: this.itemsPerPage(),
      sort: this.sortBy()
    };

    // Add search query if provided
    if (this.searchQuery()) {
      params.keyword = this.searchQuery();
    }

    // Add category filter if provided (from route parameter)
    if (this.categoryFilter().length > 0) {
      params['category[in]'] = this.categoryFilter();
    }

    this.productsService.getProducts(params).subscribe({
      next: (response) => {
        this.products.set(response.data);
        this.totalProducts.set(response.results);
        this.loading.set(false);

        // Scroll to top on page change
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (error) => {
        this.error.set(error?.message || 'Failed to load products. Please try again.');
        this.loading.set(false);
        console.error('Products loading error:', error);
      }
    });
  }

  /**
   * Handle pagination change
   */
  onPageChange(event: any): void {
    const newPage = event.page + 1; // PrimeNG paginator is 0-based
    
    if (newPage !== this.currentPage()) {
      this.currentPage.set(newPage);
      this.updateRoute();
      this.loadProducts();
    }
  }

  /**
   * Handle sort change
   */
  onSortChange(event: any): void {
    const sortValue = event?.value || event || '';
    if (sortValue !== this.sortBy()) {
      this.sortBy.set(sortValue);
      this.currentPage.set(1); // Reset to first page on sort change
      this.updateRoute();
      this.loadProducts();
    }
  }

  /**
   * Handle search submission
   */
  onSearch(): void {
    const query = this.searchControl.value?.trim() || '';
    if (query !== this.searchQuery()) {
      this.searchQuery.set(query);
      this.currentPage.set(1);
      this.updateRoute();
      this.loadProducts();
    }
  }

  /**
   * Clear search
   */
  clearSearch(): void {
    this.searchControl.setValue('');
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.updateRoute();
    this.loadProducts();
  }

  /**
   * Handle category filter change
   * PrimeNG select with [showClear]="true" will emit null when cleared
   */
  onCategoryChange(event: any): void {
    const categoryValue = event?.value || event || '';
    if (categoryValue) {
      this.categoryFilter.set([categoryValue]);
    } else {
      this.categoryFilter.set([]); // Clear filter when null/empty
    }
    this.currentPage.set(1); // Reset to first page on filter change
    this.updateRoute();
    this.loadProducts();
  }

  /**
   * Update route with current state
   */
  private updateRoute(): void {
    const queryParams: any = {};

    if (this.searchQuery()) {
      queryParams.search = this.searchQuery();
    }
    if (this.currentPage() > 1) {
      queryParams.page = this.currentPage();
    }
    if (this.sortBy() !== '-createdAt') {
      queryParams.sort = this.sortBy();
    }
    if (this.categoryFilter().length > 0) {
      queryParams['category[in]'] = this.categoryFilter().length === 1 
        ? this.categoryFilter()[0] 
        : this.categoryFilter();
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'replace'
    });
  }

  /**
   * Retry loading products
   */
  retryLoading(): void {
    this.loadProducts();
  }

  /**
   * Generate skeleton items for loading state
   */
  generateSkeletonItems(): number[] {
    return Array(12).fill(0).map((_, i) => i);
  }
}
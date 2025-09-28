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

// Feature Imports
import { ProductsService } from '../../services/products';
import { Product, ProductQueryParams } from '../../models/product.model';
import { ProductCard } from '../../../../shared/components/product-card/product-card';
import { PRODUCT_SORT_OPTIONS } from '../../constants/product-sort-options.const';

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
    // Shared
    ProductCard
  ],
  template: `<!-- Product List Page -->
<div class="product-list-page">
  
  <!-- Page Header -->
  <div class="page-header bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
    <div class="max-w-7xl mx-auto px-4 py-6">
      
      <!-- Title and Count -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            Products
          </h1>
          @if (!loading() && hasProducts()) {
            <p class="text-gray-600 dark:text-gray-400 mt-1">
              {{ totalProducts() | number }} products found
              @if (searchQuery()) {
                <span class="ml-1">for "{{ searchQuery() }}"</span>
              }
            </p>
          }
        </div>
        
        <!-- Sort Dropdown -->
        <div class="flex items-center gap-2">
          <label for="sort" class="text-sm font-medium text-gray-700 dark:text-gray-300">
            Sort by:
          </label>
          <p-select
            id="sort"
            [options]="sortOptions"
            [ngModel]="sortBy()"
            (ngModelChange)="onSortChange($event)"
            optionLabel="label"
            optionValue="value"
            [style]="{ minWidth: '200px' }"
            styleClass="sort-dropdown">
          </p-select>
        </div>
      </div>
      
      <!-- Search Bar -->
      <div class="search-section">
        <div class="flex gap-2 max-w-md">
          <div class="flex-1">
            <span class="p-input-icon-left w-full">
              <i class="pi pi-search"></i>
              <input 
                pInputText
                [formControl]="searchControl"
                placeholder="Search products..."
                class="w-full"
                (keyup.enter)="onSearch()"
              />
            </span>
          </div>
          <p-button
            icon="pi pi-search"
            severity="primary"
            (click)="onSearch()"
            [disabled]="loading()"
            styleClass="search-btn">
          </p-button>
          @if (searchQuery()) {
            <p-button
              icon="pi pi-times"
              severity="secondary"
              [outlined]="true"
              (click)="clearSearch()"
              [disabled]="loading()"
              styleClass="clear-search-btn">
            </p-button>
          }
        </div>
      </div>
      
    </div>
  </div>

  <!-- Main Content -->
  <div class="main-content bg-gray-50 dark:bg-gray-800 min-h-screen py-8">
    <div class="max-w-7xl mx-auto px-4">
      
      <!-- Loading State -->
      @if (loading()) {
        <div class="products-grid">
          @for (item of generateSkeletonItems(); track item) {
            <p-card class="product-skeleton-card">
              <p-skeleton height="200px" class="mb-4"></p-skeleton>
              <p-skeleton width="80%" height="1rem" class="mb-3"></p-skeleton>
              <p-skeleton width="60%" height="1rem" class="mb-3"></p-skeleton>
              <div class="flex justify-between items-center">
                <p-skeleton width="40%" height="1.25rem"></p-skeleton>
                <p-skeleton width="20%" height="1rem"></p-skeleton>
              </div>
              <p-skeleton height="2.5rem" class="mt-4"></p-skeleton>
            </p-card>
          }
        </div>
      }
      
      <!-- Error State -->
      @else if (error()) {
        <div class="error-state text-center py-16">
          <p-message
            severity="error"
            [text]="error()"
            class="max-w-md mx-auto mb-6">
          </p-message>
          <p-button
            label="Try Again"
            icon="pi pi-refresh"
            (click)="retryLoading()"
            severity="secondary">
          </p-button>
        </div>
      }
      
      <!-- Empty State -->
      @else if (!hasProducts() && !loading()) {
        <div class="empty-state text-center py-16">
          <div class="max-w-md mx-auto">
            <i class="pi pi-search text-6xl text-gray-400 dark:text-gray-600 mb-6"></i>
            <h3 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              @if (searchQuery()) {
                No products found
              } @else {
                No products available
              }
            </h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              @if (searchQuery()) {
                Try adjusting your search terms or clear the search to see all products.
              } @else {
                Products will appear here when they become available.
              }
            </p>
            @if (searchQuery()) {
              <p-button
                label="Clear Search"
                icon="pi pi-times"
                (click)="clearSearch()"
                severity="secondary"
                [outlined]="true">
              </p-button>
            }
          </div>
        </div>
      }
      
      <!-- Products Grid -->
      @else if (hasProducts()) {
        <div class="products-content">
          
          <!-- Products Grid -->
          <div class="products-grid">
            @for (product of products(); track product._id) {
              <app-product-card [product]="product"></app-product-card>
            }
          </div>
          
          <!-- Pagination -->
          @if (totalPages() > 1) {
            <div class="pagination-section mt-12">
              <p-paginator
                [rows]="itemsPerPage()"
                [totalRecords]="totalProducts()"
                [first]="(currentPage() - 1) * itemsPerPage()"
                (onPageChange)="onPageChange($event)"
                [showCurrentPageReport]="true"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
                [showJumpToPageDropdown]="totalPages() > 5"
                styleClass="product-paginator">
              </p-paginator>
            </div>
          }
          
        </div>
      }
      
    </div>
  </div>
  
</div>`,
  styles: [`
// Product List Component Styles
.product-list-page {
  min-height: 100vh;
  background: var(--surface-ground);
  
  // Page Header
  .page-header {
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(8px);
    
    .search-section {
      .p-input-icon-left {
        width: 100%;
        
        input {
          padding-left: 2.5rem;
          border-radius: 8px;
          transition: all 0.3s ease;
          
          &:focus {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.2);
          }
        }
      }
      
      .search-btn, .clear-search-btn {
        border-radius: 8px;
        transition: all 0.2s ease;
        
        &:hover {
          transform: translateY(-1px);
        }
      }
    }
  }

  // Main Content
  .main-content {
    .products-grid {
      display: grid;
      gap: 1.5rem;
      
      // Responsive grid layout
      grid-template-columns: 1fr;
      
      @media (min-width: 640px) {
        grid-template-columns: repeat(2, 1fr);
      }
      
      @media (min-width: 768px) {
        grid-template-columns: repeat(3, 1fr);
      }
      
      @media (min-width: 1024px) {
        grid-template-columns: repeat(4, 1fr);
      }
      
      @media (min-width: 1280px) {
        grid-template-columns: repeat(5, 1fr);
      }
      
      @media (min-width: 1536px) {
        grid-template-columns: repeat(6, 1fr);
      }
    }
    
    // Skeleton Loading Cards
    .product-skeleton-card {
      height: 400px;
      
      ::ng-deep .p-card-body {
        height: 100%;
        display: flex;
        flex-direction: column;
        
        .p-skeleton {
          border-radius: 6px;
          
          &:first-child {
            border-radius: 8px;
          }
        }
      }
    }
    
    // Error State
    .error-state {
      .p-message {
        display: inline-block;
        
        ::ng-deep .p-message-wrapper {
          border-radius: 12px;
          padding: 1.5rem;
        }
      }
    }
    
    // Empty State
    .empty-state {
      i.pi {
        opacity: 0.5;
        animation: pulse 2s ease-in-out infinite;
      }
    }
  }

  // Pagination Section
  .pagination-section {
    display: flex;
    justify-content: center;
    background: white;
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid var(--surface-border);
    
    .product-paginator {
      ::ng-deep {
        .p-paginator {
          background: transparent;
          border: none;
          padding: 0.5rem;
          
          .p-paginator-pages {
            .p-paginator-page {
              border-radius: 8px;
              margin: 0 0.25rem;
              transition: all 0.2s ease;
              
              &:hover {
                background: var(--primary-color);
                color: white;
                transform: translateY(-1px);
              }
              
              &.p-highlight {
                background: var(--primary-color);
                color: white;
                box-shadow: 0 2px 8px rgba(var(--primary-color-rgb), 0.3);
              }
            }
          }
          
          .p-paginator-prev, .p-paginator-next {
            border-radius: 8px;
            transition: all 0.2s ease;
            
            &:hover:not(.p-disabled) {
              background: var(--surface-hover);
              transform: translateY(-1px);
            }
          }
        }
      }
    }
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.8;
  }
}

// Products Grid Animation
.products-grid {
  app-product-card {
    animation: fadeInUp 0.6s ease-out;
    animation-fill-mode: both;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`]
})
export class ProductListComponent implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Component state
  readonly products = signal<Product[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string>('');
  readonly totalProducts = signal(0);
  readonly currentPage = signal(1);
  readonly itemsPerPage = signal(20);

  // Search and filters
  readonly searchQuery = signal('');
  readonly sortBy = signal('-createdAt'); // Default to newest first
  readonly searchControl = new FormControl('');

  // Sort options
  readonly sortOptions = [...PRODUCT_SORT_OPTIONS];

  // Computed properties
  readonly totalPages = computed(() => 
    Math.ceil(this.totalProducts() / this.itemsPerPage())
  );

  readonly hasProducts = computed(() => this.products().length > 0);
  readonly isFirstPage = computed(() => this.currentPage() === 1);
  readonly isLastPage = computed(() => this.currentPage() >= this.totalPages());

  ngOnInit(): void {
    this.initializeFromRoute();
    this.loadProducts();
    this.setupSearchControl();
  }

  /**
   * Initialize component state from route parameters
   */
  private initializeFromRoute(): void {
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchQuery.set(params['search']);
        this.searchControl.setValue(params['search'], { emitEvent: false });
      }
      if (params['page']) {
        this.currentPage.set(+params['page']);
      }
      if (params['sort']) {
        this.sortBy.set(params['sort']);
      }
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
    return Array(8).fill(0).map((_, i) => i);
  }
}

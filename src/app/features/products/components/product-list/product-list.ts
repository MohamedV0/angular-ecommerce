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
    return Array(12).fill(0).map((_, i) => i);
  }
}
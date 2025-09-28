import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { ProductCard } from '../../../../shared/components/product-card/product-card';
import { Product } from '../../../products/models/product.model';
import { ProductsService } from '../../../products/services/products';

@Component({
  selector: 'app-featured-products',
  imports: [CommonModule, TranslateModule, ButtonModule, SkeletonModule, ProductCard],
  template: `
    <section class="featured-products py-12 bg-gray-50 dark:bg-gray-800">
      <div class="max-w-7xl mx-auto px-4">
        
        <!-- Section Header -->
        <div class="flex items-center justify-between mb-8">
          <div class="text-center md:text-left">
            <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {{ 'FEATURED_PRODUCTS' | translate }}
            </h2>
            <p class="text-gray-600 dark:text-gray-400">
              {{ 'FEATURED_PRODUCTS_DESCRIPTION' | translate }}
            </p>
          </div>
          
          <p-button 
            label="View All Products"
            icon="pi pi-arrow-right"
            iconPos="right" 
            routerLink="/products"
            severity="secondary"
            [text]="true"
            class="hidden md:block">
          </p-button>
        </div>
        
        <!-- Products Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
          @if (loading()) {
            @for (item of [1,2,3,4,5,6,7,8]; track item) {
              <div class="bg-white dark:bg-gray-700 rounded-lg shadow-sm p-4">
                <p-skeleton width="100%" height="200px" class="mb-4"></p-skeleton>
                <p-skeleton width="80%" height="1.5rem" class="mb-2"></p-skeleton>
                <p-skeleton width="60%" height="1rem" class="mb-4"></p-skeleton>
                <p-skeleton width="40%" height="1.5rem"></p-skeleton>
              </div>
            }
          } @else {
            @for (product of featuredProducts(); track product._id) {
              <app-product-card [product]="product"></app-product-card>
            } @empty {
              <div class="col-span-full text-center text-gray-500 dark:text-gray-400 py-8">
                <p>{{ 'NO_FEATURED_PRODUCTS' | translate }}</p>
              </div>
            }
          }
        </div>
        
        <!-- Load More Button (Mobile) -->
        <div class="text-center mt-8 md:hidden">
          <p-button 
            label="Load More Products"
            icon="pi pi-plus"
            severity="primary"
            size="large"
            routerLink="/products"
            class="w-full sm:w-auto">
          </p-button>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
    }

    .featured-products {
      background-color: var(--surface-ground);
      transition: all 0.3s ease;
      
      .product-grid {
        display: grid;
        gap: 1.5rem;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      }

      /* Dark mode adjustments */
      &.dark {
        background-color: var(--surface-800);
      }
    }
  `]
})
export class FeaturedProducts implements OnInit {
  private productsService = inject(ProductsService);
  
  featuredProducts = signal<Product[]>([]);
  loading = signal(true);
  
  ngOnInit() {
    this.loadFeaturedProducts();
  }
  
  private loadFeaturedProducts() {
    this.loading.set(true);
    
    this.productsService.getFeaturedProducts().subscribe({
      next: (products) => {
        this.featuredProducts.set(products);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading featured products:', error);
        this.featuredProducts.set([]);
        this.loading.set(false);
      }
    });
  }
}
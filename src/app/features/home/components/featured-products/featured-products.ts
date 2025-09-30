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
  templateUrl: './featured-products.html',
  styleUrl: './featured-products.scss'
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
    
    // Load 6 featured products for homepage
    this.productsService.getFeaturedProducts(6).subscribe({
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
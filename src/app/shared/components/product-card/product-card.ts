import { Component, input, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// PrimeNG Components
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { RatingModule } from 'primeng/rating';
import { ChipModule } from 'primeng/chip';

// Feature Imports
import { Product } from '../../../features/products/models/product.model';

/**
 * ProductCard Component
 * Reusable product card following PrimeNG + Tailwind + Angular best practices
 */
@Component({
  selector: 'app-product-card',
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule,
    // PrimeNG
    ButtonModule, 
    BadgeModule, 
    RatingModule, 
    ChipModule
  ],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductCard {
  private readonly router = inject(Router);
  
  // Input signals
  readonly product = input.required<Product>();

  // Computed properties - following Angular best practices with signals
  readonly currentPrice = computed(() => {
    const prod = this.product();
    return prod.priceAfterDiscount && prod.priceAfterDiscount < prod.price 
      ? prod.priceAfterDiscount 
      : prod.price;
  });

  readonly hasDiscount = computed(() => {
    const prod = this.product();
    return !!(prod.priceAfterDiscount && prod.priceAfterDiscount < prod.price);
  });

  readonly discountPercentage = computed(() => {
    const prod = this.product();
    if (!this.hasDiscount()) return '';
    
    const discount = Math.round((1 - (prod.priceAfterDiscount! / prod.price)) * 100);
    return `-${discount}%`;
  });

  readonly isInStock = computed(() => this.product().quantity > 0);

  // Template method aliases for computed properties
  getCurrentPrice = () => this.currentPrice();
  getDiscountPercentage = () => this.discountPercentage();

  /**
   * Navigate to product details page
   */
  viewProductDetails(): void {
    const prod = this.product();
    this.router.navigate(['/products', prod._id]);
  }

  /**
   * Add product to cart with event prevention
   */
  onAddToCartClick(event: Event): void {
    event.stopPropagation(); // Prevent card click
    this.addToCart();
  }

  /**
   * Add product to wishlist with event prevention
   */
  onWishlistClick(event: Event): void {
    event.stopPropagation(); // Prevent card click
    this.addToWishlist();
  }

  /**
   * Add product to cart (placeholder implementation)
   */
  private addToCart(): void {
    const prod = this.product();
    if (!this.isInStock()) {
      console.warn('Cannot add out of stock product to cart:', prod.title);
      return;
    }
    
    // TODO: Implement cart service integration
    console.log('Add to cart:', prod.title);
  }

  /**
   * Add product to wishlist (placeholder implementation)
   */
  private addToWishlist(): void {
    const prod = this.product();
    // TODO: Implement wishlist service integration
    console.log('Add to wishlist:', prod.title);
  }
}

import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { RatingModule } from 'primeng/rating';

// Import from products domain - the real API-matching model  
import { Product } from '../../../features/products/models/product.model';

@Component({
  selector: 'app-product-card',
  imports: [CommonModule, FormsModule, RouterModule, CardModule, ButtonModule, BadgeModule, RatingModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss'
})
export class ProductCard {
  private readonly router = inject(Router);
  
  product = input.required<Product>();

  /**
   * Get the current display price (discounted or regular)
   */
  getCurrentPrice(): number {
    const prod = this.product();
    return prod.priceAfterDiscount && prod.priceAfterDiscount < prod.price 
      ? prod.priceAfterDiscount 
      : prod.price;
  }

  /**
   * Check if the product has a discount
   */
  hasDiscount(): boolean {
    const prod = this.product();
    return !!(prod.priceAfterDiscount && prod.priceAfterDiscount < prod.price);
  }

  /**
   * Calculate and format discount percentage
   */
  getDiscountPercentage(): string {
    const prod = this.product();
    if (!this.hasDiscount()) return '';
    
    const discount = Math.round((1 - (prod.priceAfterDiscount! / prod.price)) * 100);
    return `-${discount}%`;
  }

  /**
   * Navigate to product details page
   */
  viewProductDetails(): void {
    const prod = this.product();
    this.router.navigate(['/products', prod._id]);
  }

  /**
   * Add product to cart (placeholder)
   */
  addToCart(): void {
    // TODO: Implement add to cart functionality
    console.log('Add to cart:', this.product().title);
  }

  /**
   * Add product to wishlist (placeholder)
   */
  addToWishlist(): void {
    // TODO: Implement add to wishlist functionality
    console.log('Add to wishlist:', this.product().title);
  }
}

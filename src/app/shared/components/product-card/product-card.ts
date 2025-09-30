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
import { CartStore } from '../../../features/cart/store/cart.store';
import { WishlistStore } from '../../../features/wishlist/store/wishlist.store';

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
  private readonly cartStore = inject(CartStore);
  private readonly wishlistStore = inject(WishlistStore);
  
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

  // Cart-related computed properties
  readonly isInCart = computed(() => {
    const productId = this.product()._id;
    return this.cartStore.isProductInCart()(productId);
  });

  readonly cartQuantity = computed(() => {
    const productId = this.product()._id;
    return this.cartStore.getProductQuantity()(productId);
  });

  // ✅ FIXED: Use per-product loading state instead of global
  readonly isAddingToCart = computed(() => {
    const productId = this.product()._id;
    return this.cartStore.isProductLoading()(productId);
  });

  readonly canAddToCart = computed(() => {
    return this.isInStock() && !this.isAddingToCart();
  });

  // Wishlist-related computed properties
  readonly isInWishlist = computed(() => {
    const productId = this.product()._id;
    return this.wishlistStore.isProductInWishlist()(productId);
  });

  readonly isTogglingWishlist = computed(() => {
    const productId = this.product()._id;
    return this.wishlistStore.isProductLoading()(productId);
  });

  readonly wishlistIconClass = computed(() => {
    return this.isInWishlist() ? 'pi pi-heart-fill' : 'pi pi-heart';
  });

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
   * Add product to cart using CartStore
   */
  private addToCart(): void {
    const prod = this.product();
    if (!this.canAddToCart()) {
      console.warn('Cannot add product to cart:', prod.title);
      return;
    }
    
    // Use CartStore to add product to cart
    this.cartStore.addToCart({ 
      product: prod, 
      quantity: 1 
    });
  }

  /**
   * Toggle product wishlist status (add/remove)
   * Uses WishlistStore toggle method
   */
  private addToWishlist(): void {
    const prod = this.product();
    
    // Toggle wishlist status (add if not in wishlist, remove if in wishlist)
    this.wishlistStore.toggleWishlist(prod);
  }
}

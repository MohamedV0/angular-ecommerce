import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { RatingModule } from 'primeng/rating';

export interface Product {
  id: string;
  title: string;
  brand?: string;
  category?: string;
  price: number;
  priceAfterDiscount?: number;
  imageCover: string;
  ratingsAverage?: number;
  ratingsQuantity?: number;
  sold?: number;
  quantity?: number;
}

@Component({
  selector: 'app-product-card',
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, BadgeModule, RatingModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss'
})
export class ProductCard {
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
}

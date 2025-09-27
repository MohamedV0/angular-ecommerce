import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { ProductCard, Product } from '../../../../shared/components/product-card/product-card';

@Component({
  selector: 'app-featured-products',
  imports: [CommonModule, TranslateModule, ButtonModule, ProductCard],
  template: `
    <section class="featured-products py-12 bg-gray-50 dark:bg-gray-800">
      <div class="max-w-7xl mx-auto px-4">
        
        <!-- Section Header -->
        <div class="flex justify-between items-center mb-8">
          <div>
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Featured Products
            </h2>
            <p class="text-gray-600 dark:text-gray-300">
              Discover our most popular and trending products
            </p>
          </div>
          <p-button 
            label="View All Products"
            icon="pi pi-arrow-right"
            severity="secondary"
            [text]="true"
            class="hidden md:block">
          </p-button>
        </div>
        
        <!-- Products Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
          @for (product of featuredProducts; track product.id) {
            <app-product-card [product]="product"></app-product-card>
          }
        </div>
        
        <!-- Load More Button (Mobile) -->
        <div class="text-center mt-8 md:hidden">
          <p-button 
            label="Load More Products"
            icon="pi pi-plus"
            severity="primary"
            size="large"
            class="w-full max-w-sm">
          </p-button>
        </div>
        
      </div>
    </section>
  `,
  styles: `
    .featured-products {
      .grid {
        // Ensure consistent card heights
        > * {
          height: auto;
        }
      }
    }
    
    // RTL Support
    [dir="rtl"] {
      .featured-products {
        .flex.justify-between {
          flex-direction: row-reverse;
        }
      }
    }
  `
})
export class FeaturedProducts {
  featuredProducts: Product[] = [
    {
      id: '1',
      title: 'Archer VR300 Wi-Fi Router',
      brand: 'Electronics',
      price: 1699,
      imageCover: 'https://via.placeholder.com/300x300/3b82f6/ffffff?text=Router',
      ratingsAverage: 4.5,
      ratingsQuantity: 128,
      sold: 450
    },
    {
      id: '2',
      title: 'PIXMA G3420 All-in-One Printer',
      brand: 'Electronics',
      price: 5999,
      priceAfterDiscount: 4999,
      imageCover: 'https://via.placeholder.com/300x300/10b981/ffffff?text=Printer',
      ratingsAverage: 4.5,
      ratingsQuantity: 89,
      sold: 320
    },
    {
      id: '3',
      title: 'Canon EOS M50 Digital Camera',
      brand: 'Electronics',
      price: 19699,
      imageCover: 'https://via.placeholder.com/300x300/ef4444/ffffff?text=Camera',
      ratingsAverage: 4.3,
      ratingsQuantity: 67,
      sold: 180
    },
    {
      id: '4',
      title: 'PlayStation 5 DualSense Controller',
      brand: 'Electronics',
      price: 1945,
      imageCover: 'https://via.placeholder.com/300x300/8b5cf6/ffffff?text=PS5',
      ratingsAverage: 4.8,
      ratingsQuantity: 203,
      sold: 890
    },
    {
      id: '5',
      title: 'Galaxy Buds Pro Wireless Earbuds',
      brand: 'Electronics',
      price: 3999,
      priceAfterDiscount: 3199,
      imageCover: 'https://via.placeholder.com/300x300/1f2937/ffffff?text=Buds',
      ratingsAverage: 4.6,
      ratingsQuantity: 156,
      sold: 670
    },
    {
      id: '6',
      title: 'WH-CH510 Wireless Headphones',
      brand: 'Electronics',
      price: 1549,
      imageCover: 'https://via.placeholder.com/300x300/f59e0b/ffffff?text=Headphones',
      ratingsAverage: 4.2,
      ratingsQuantity: 94,
      sold: 380
    },
    {
      id: '7',
      title: 'Gaming Laptop ASUS TUF F15',
      brand: 'Electronics',
      price: 42960,
      priceAfterDiscount: 38999,
      imageCover: 'https://via.placeholder.com/300x300/059669/ffffff?text=Laptop',
      ratingsAverage: 4.7,
      ratingsQuantity: 45,
      sold: 125
    },
    {
      id: '8',
      title: '5530-G15 Gaming Desktop',
      brand: 'Electronics',
      price: 42960,
      imageCover: 'https://via.placeholder.com/300x300/dc2626/ffffff?text=Desktop',
      ratingsAverage: 4.4,
      ratingsQuantity: 32,
      sold: 78
    },
    {
      id: '9',
      title: 'IdeaPad Gaming Laptop',
      brand: 'Electronics',
      price: 27699,
      priceAfterDiscount: 24999,
      imageCover: 'https://via.placeholder.com/300x300/7c3aed/ffffff?text=Gaming',
      ratingsAverage: 4.6,
      ratingsQuantity: 87,
      sold: 210
    },
    {
      id: '10',
      title: 'IdeaPad 5 Business Laptop',
      brand: 'Electronics',
      price: 29999,
      imageCover: 'https://via.placeholder.com/300x300/0891b2/ffffff?text=Business',
      ratingsAverage: 4.3,
      ratingsQuantity: 64,
      sold: 156
    },
    {
      id: '11',
      title: '43 inch Smart LED TV',
      brand: 'Electronics',
      price: 8999,
      priceAfterDiscount: 7899,
      imageCover: 'https://via.placeholder.com/300x300/be185d/ffffff?text=TV',
      ratingsAverage: 4.5,
      ratingsQuantity: 112,
      sold: 290
    },
    {
      id: '12',
      title: '4K Smart Monitor 32"',
      brand: 'Electronics',
      price: 12999,
      imageCover: 'https://via.placeholder.com/300x300/16a34a/ffffff?text=Monitor',
      ratingsAverage: 4.4,
      ratingsQuantity: 76,
      sold: 198
    }
  ];
}

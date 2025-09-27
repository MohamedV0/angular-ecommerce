import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-categories-showcase',
  imports: [CommonModule, TranslateModule, CardModule],
  template: `
    <section class="categories-showcase py-12 bg-white dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4">
        
        <!-- Section Header -->
        <div class="text-center mb-10">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Shop Popular Categories
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover our wide range of product categories and find exactly what you're looking for
          </p>
        </div>
        
        <!-- Categories Grid -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          @for (category of categories; track category.id) {
            <p-card 
              class="category-card cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
              styleClass="h-full border-gray-200 dark:border-gray-700">
              
              <ng-template #header>
                <div class="category-image-container relative overflow-hidden rounded-t-lg">
                  <img 
                    [src]="category.image" 
                    [alt]="category.name"
                    class="w-full h-32 object-cover transition-transform duration-300 hover:scale-110">
                  <div class="category-overlay absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </ng-template>
              
              <div class="text-center py-4">
                <h3 class="font-semibold text-gray-900 dark:text-white text-sm md:text-base line-clamp-2">
                  {{ category.name }}
                </h3>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {{ category.itemCount }} items
                </p>
              </div>
            </p-card>
          }
        </div>
        
        <!-- View All Button -->
        <div class="text-center mt-10">
          <button class="inline-flex items-center px-6 py-3 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200">
            View All Categories
            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
        
      </div>
    </section>
  `,
  styles: `
    .categories-showcase {
      .category-card {
        transition: all 0.3s ease;
        
        &:hover {
          .category-image-container img {
            transform: scale(1.05);
          }
        }
      }
      
      .category-image-container {
        position: relative;
        
        &::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent 0%, rgba(34, 197, 94, 0.1) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        &:hover::after {
          opacity: 1;
        }
      }
    }
    
    // Line clamp utility
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    // RTL Support
    [dir="rtl"] {
      .categories-showcase {
        .text-center button {
          flex-direction: row-reverse;
          
          svg {
            margin-left: 0;
            margin-right: 0.5rem;
            transform: rotate(180deg);
          }
        }
      }
    }
  `
})
export class CategoriesShowcase {
  categories = [
    {
      id: 1,
      name: 'Electronics',
      image: 'https://via.placeholder.com/200x150/3b82f6/ffffff?text=Electronics',
      itemCount: 1250,
      slug: 'electronics'
    },
    {
      id: 2,
      name: 'Mobiles',
      image: 'https://via.placeholder.com/200x150/ef4444/ffffff?text=Mobiles',
      itemCount: 890,
      slug: 'mobiles'
    },
    {
      id: 3,
      name: "Men's Fashion",
      image: 'https://via.placeholder.com/200x150/8b5cf6/ffffff?text=Men',
      itemCount: 2100,
      slug: 'mens-fashion'
    },
    {
      id: 4,
      name: "Women's Fashion",
      image: 'https://via.placeholder.com/200x150/ec4899/ffffff?text=Women',
      itemCount: 3200,
      slug: 'womens-fashion'
    },
    {
      id: 5,
      name: 'Home & Living',
      image: 'https://via.placeholder.com/200x150/f59e0b/ffffff?text=Home',
      itemCount: 1800,
      slug: 'home-living'
    },
    {
      id: 6,
      name: 'Beauty & Health',
      image: 'https://via.placeholder.com/200x150/10b981/ffffff?text=Beauty',
      itemCount: 750,
      slug: 'beauty-health'
    },
    {
      id: 7,
      name: 'Baby & Toys',
      image: 'https://via.placeholder.com/200x150/f97316/ffffff?text=Baby',
      itemCount: 520,
      slug: 'baby-toys'
    },
    {
      id: 8,
      name: 'Sports',
      image: 'https://via.placeholder.com/200x150/06b6d4/ffffff?text=Sports',
      itemCount: 680,
      slug: 'sports'
    }
  ];
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-hero-section',
  imports: [CommonModule, TranslateModule, CarouselModule, ButtonModule],
  template: `
    <section class="hero-section bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 py-12">
      <div class="max-w-7xl mx-auto px-4">
        <p-carousel 
          [value]="heroSlides" 
          [numVisible]="1" 
          [numScroll]="1" 
          [circular]="true" 
          [autoplayInterval]="4000"
          [showIndicators]="true"
          [showNavigators]="true"
          class="hero-carousel">
          
          <ng-template #item let-slide>
            <div class="hero-slide bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center p-8 lg:p-12">
                
                <!-- Content Side -->
                <div class="hero-content">
                  <h1 class="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                    {{ slide.title }}
                  </h1>
                  <p class="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                    {{ slide.description }}
                  </p>
                  <div class="hero-actions flex flex-col sm:flex-row gap-4">
                    <p-button 
                      [label]="slide.primaryAction.label"
                      icon="pi pi-shopping-cart"
                      severity="primary"
                      size="large"
                      class="flex-1 sm:flex-none">
                    </p-button>
                    <p-button 
                      [label]="slide.secondaryAction.label"
                      icon="pi pi-arrow-right"
                      severity="secondary"
                      [outlined]="true"
                      size="large"
                      class="flex-1 sm:flex-none">
                    </p-button>
                  </div>
                </div>
                
                <!-- Image Side -->
                <div class="hero-image">
                  <img 
                    [src]="slide.image" 
                    [alt]="slide.title"
                    class="w-full h-64 lg:h-80 object-cover rounded-lg shadow-md">
                </div>
                
              </div>
            </div>
          </ng-template>
          
        </p-carousel>
      </div>
    </section>
  `,
  styles: `
    .hero-section {
      :host {
        display: block;
      }
      
      .hero-carousel {
        .p-carousel-content {
          .p-carousel-container {
            .p-carousel-items-content {
              .p-carousel-items-container {
                .p-carousel-item {
                  padding: 0.5rem;
                }
              }
            }
          }
          
          .p-carousel-indicators {
            .p-carousel-indicator button {
              background-color: rgba(255, 255, 255, 0.5);
              
              &.p-highlight {
                background-color: var(--primary-color);
              }
            }
          }
        }
      }
      
      .hero-slide {
        min-height: 400px;
        transition: transform 0.3s ease;
        
        &:hover {
          transform: translateY(-2px);
        }
      }
      
      .hero-image img {
        transition: transform 0.3s ease;
        
        &:hover {
          transform: scale(1.02);
        }
      }
    }
    
    // RTL Support
    [dir="rtl"] {
      .hero-content {
        text-align: right;
      }
      
      .hero-actions {
        flex-direction: row-reverse;
        
        @media (max-width: 640px) {
          flex-direction: column;
        }
      }
    }
  `
})
export class HeroSection {
  heroSlides = [
    {
      id: 1,
      title: 'Fresh Products Daily',
      description: 'Discover our premium collection of fresh products delivered right to your doorstep with guaranteed quality and freshness.',
      image: 'https://via.placeholder.com/600x400/22c55e/ffffff?text=Fresh+Products',
      primaryAction: { label: 'Shop Now', action: 'shop' },
      secondaryAction: { label: 'Learn More', action: 'learn' }
    },
    {
      id: 2,
      title: 'Electronics & Tech',
      description: 'Explore the latest in technology and electronics with competitive prices and warranty coverage on all products.',
      image: 'https://via.placeholder.com/600x400/3b82f6/ffffff?text=Electronics',
      primaryAction: { label: 'Browse Tech', action: 'tech' },
      secondaryAction: { label: 'View Deals', action: 'deals' }
    },
    {
      id: 3,
      title: 'Fashion & Style',
      description: 'Stay trendy with our curated fashion collection featuring the latest styles for men, women, and children.',
      image: 'https://via.placeholder.com/600x400/ec4899/ffffff?text=Fashion',
      primaryAction: { label: 'Explore Fashion', action: 'fashion' },
      secondaryAction: { label: 'New Arrivals', action: 'new' }
    }
  ];
}


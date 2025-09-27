import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

// Home Feature Components
import { HeroSection } from '../hero-section/hero-section';
import { CategoriesShowcase } from '../categories-showcase/categories-showcase';
import { FeaturedProducts } from '../featured-products/featured-products';

@Component({
  selector: 'app-home-page',
  imports: [
    CommonModule, 
    TranslateModule, 
    HeroSection, 
    CategoriesShowcase, 
    FeaturedProducts
  ],
  template: `
    <div class="home-page">
      
      <!-- Hero/Slider Section -->
      <app-hero-section></app-hero-section>
      
      <!-- Categories Showcase Section -->
      <app-categories-showcase></app-categories-showcase>
      
      <!-- Featured Products Section -->
      <app-featured-products></app-featured-products>
      
    </div>
  `,
  styles: `
    .home-page {
      // Home page acts as a container for all sections
      // Each section handles its own styling and spacing
      
      // Ensure smooth scrolling between sections
      scroll-behavior: smooth;
      
      // Minimum height to ensure proper layout
      min-height: 100vh;
    }
    
    // RTL Support
    [dir="rtl"] {
      .home-page {
        direction: rtl;
      }
    }
  `
})
export class HomePage {
  // Main home page component that composes all home feature sections
  // Following the BRD structure: Hero → Categories → Products
}

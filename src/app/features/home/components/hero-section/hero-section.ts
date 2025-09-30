import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-hero-section',
  imports: [CommonModule, TranslateModule, CarouselModule, ButtonModule],
  templateUrl: './hero-section.html',
  styleUrl: './hero-section.scss'
})
export class HeroSection {
  heroSlides = [
    {
      id: 1,
      title: 'Fresh Products Daily',
      description: 'Discover our premium collection of fresh products delivered right to your doorstep with guaranteed quality and freshness.',
      image: 'images/Fresh-Products.jpg',
      primaryAction: { label: 'Shop Now', action: 'shop' },
      secondaryAction: { label: 'Learn More', action: 'learn' }
    },
    {
      id: 2,
      title: 'Electronics & Tech',
      description: 'Explore the latest in technology and electronics with competitive prices and warranty coverage on all products.',
      image: 'images/Electronics.jpg',
      primaryAction: { label: 'Browse Tech', action: 'tech' },
      secondaryAction: { label: 'View Deals', action: 'deals' }
    },
    {
      id: 3,
      title: 'Fashion & Style',
      description: 'Stay trendy with our curated fashion collection featuring the latest styles for men, women, and children.',
      image: 'images/Fashion.jpg',
      primaryAction: { label: 'Explore Fashion', action: 'fashion' },
      secondaryAction: { label: 'New Arrivals', action: 'new' }
    }
  ];
}


/**
 * FitFuel Homepage Hero Carousel Module
 * Automatic, interactive, responsive horizontal carousel with seamless infinite looping.
 */
(function() {
  'use strict';

  class HeroCarousel {
    constructor() {
      this.container = document.getElementById('heroCarouselContainer');
      this.track = document.getElementById('heroCarouselTrack');
      this.viewport = document.getElementById('heroCarouselViewport');
      this.prevBtn = document.getElementById('heroCarouselPrevBtn');
      this.nextBtn = document.getElementById('heroCarouselNextBtn');
      this.pagination = document.getElementById('heroCarouselPagination');
      this.dots = [];

      this.numRealSlides = 4;
      this.clonesBefore = 2;
      this.startIndex = this.clonesBefore; // Index 2 in track
      this.endIndex = this.startIndex + this.numRealSlides - 1; // Index 5 in track
      this.currentIndex = this.startIndex;

      this.autoplayDelay = 1800; // 1.8s
      this.autoplayTimer = null;
      this.isTransitioning = false;
      this.isHovered = false;
      this.isSwiping = false;
      this.touchStartX = 0;
      this.touchStartY = 0;
      this.step = 0;

      this.init();
    }

    init() {
      if (!this.track || !this.container) return;

      this.dots = Array.from(this.pagination ? this.pagination.querySelectorAll('.hero-carousel-dot') : []);

      // Calculate step
      this.updateStep();

      // Position initially at real slide 1 (index 2) without transition
      this.track.style.transition = 'none';
      this.setTranslate(-this.currentIndex * this.step);
      this.track.offsetHeight; // force reflow
      this.track.style.transition = '';

      this.updateActiveDot();
      this.bindEvents();
      this.startAutoplay();
    }

    updateStep() {
      const firstSlide = this.track.querySelector('.hero-carousel-slide');
      if (!firstSlide) return;
      const rect = firstSlide.getBoundingClientRect();
      const style = window.getComputedStyle(this.track);
      const gap = parseFloat(style.gap || style.columnGap || '18') || 18;
      this.step = rect.width + gap;
    }

    setTranslate(px) {
      this.track.style.transform = `translate3d(${px}px, 0, 0)`;
    }

    updateActiveDot() {
      const activeDotIndex = ((this.currentIndex - this.startIndex) % this.numRealSlides + this.numRealSlides) % this.numRealSlides;
      this.dots.forEach((dot, idx) => {
        const isActive = idx === activeDotIndex;
        dot.classList.toggle('active', isActive);
        dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    }

    goTo(index, smooth = true) {
      if (this.isTransitioning) return;
      this.isTransitioning = true;
      this.currentIndex = index;

      if (!smooth || this.prefersReducedMotion()) {
        this.track.style.transition = 'none';
      } else {
        this.track.style.transition = 'transform 0.55s cubic-bezier(0.25, 1, 0.5, 1)';
      }

      this.setTranslate(-this.currentIndex * this.step);
      this.updateActiveDot();

      // Fallback timeout in case transitionend does not fire
      clearTimeout(this.safetyTimeout);
      this.safetyTimeout = setTimeout(() => {
        this.isTransitioning = false;
      }, 620);
    }

    next() {
      this.goTo(this.currentIndex + 1, true);
    }

    prev() {
      this.goTo(this.currentIndex - 1, true);
    }

    goToSlide(slideIndex) {
      if (slideIndex < 0 || slideIndex >= this.numRealSlides) return;
      this.goTo(this.startIndex + slideIndex, true);
      this.resetAutoplay();
    }

    handleTransitionEnd(e) {
      if (e.target !== this.track) return;
      this.isTransitioning = false;

      // Seamless infinite loop wrapping
      if (this.currentIndex > this.endIndex) {
        // Scrolled past last real slide to clone of slide 1
        this.currentIndex = this.startIndex;
        this.track.style.transition = 'none';
        this.setTranslate(-this.currentIndex * this.step);
        this.track.offsetHeight;
        this.track.style.transition = '';
      } else if (this.currentIndex < this.startIndex) {
        // Scrolled backward past first real slide to clone of slide 4
        this.currentIndex = this.endIndex;
        this.track.style.transition = 'none';
        this.setTranslate(-this.currentIndex * this.step);
        this.track.offsetHeight;
        this.track.style.transition = '';
      }

      this.updateActiveDot();
    }

    prefersReducedMotion() {
      return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    startAutoplay() {
      this.stopAutoplay();
      if (this.prefersReducedMotion()) return;
      if (this.isHovered || this.isSwiping) return;
      if (document.hidden) return;
      if (typeof activeView !== 'undefined' && activeView !== 'today') return;

      this.autoplayTimer = setInterval(() => {
        this.next();
      }, this.autoplayDelay);
    }

    stopAutoplay() {
      if (this.autoplayTimer) {
        clearInterval(this.autoplayTimer);
        this.autoplayTimer = null;
      }
    }

    resetAutoplay() {
      this.stopAutoplay();
      this.startAutoplay();
    }

    bindEvents() {
      // Prev & Next Buttons
      if (this.prevBtn) {
        this.prevBtn.onclick = (e) => {
          e.preventDefault();
          this.prev();
          this.resetAutoplay();
        };
      }

      if (this.nextBtn) {
        this.nextBtn.onclick = (e) => {
          e.preventDefault();
          this.next();
          this.resetAutoplay();
        };
      }

      // Pagination dots
      this.dots.forEach(dot => {
        dot.onclick = (e) => {
          e.preventDefault();
          const targetSlide = parseInt(dot.dataset.slideIndex, 10);
          this.goToSlide(targetSlide);
        };
      });

      // Transition End for seamless wrap
      this.track.addEventListener('transitionend', (e) => this.handleTransitionEnd(e));

      // Pause on hover
      this.container.addEventListener('mouseenter', () => {
        this.isHovered = true;
        this.stopAutoplay();
      });

      this.container.addEventListener('mouseleave', () => {
        this.isHovered = false;
        this.startAutoplay();
      });

      // Keyboard navigation
      const handleKey = (e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.prev();
          this.resetAutoplay();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          this.next();
          this.resetAutoplay();
        }
      };

      if (this.viewport) {
        this.viewport.addEventListener('keydown', handleKey);
      }
      this.container.addEventListener('keydown', handleKey);

      // Touch swipe gestures
      this.viewport.addEventListener('touchstart', (e) => {
        this.isSwiping = true;
        this.stopAutoplay();
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
      }, { passive: true });

      this.viewport.addEventListener('touchend', (e) => {
        this.isSwiping = false;
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const diffX = this.touchStartX - touchEndX;
        const diffY = this.touchStartY - touchEndY;

        // If predominantly horizontal swipe with >= 40px delta
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
          if (diffX > 0) {
            this.next();
          } else {
            this.prev();
          }
        }
        this.resetAutoplay();
      }, { passive: true });

      // Tab visibility change
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.stopAutoplay();
        } else {
          this.startAutoplay();
        }
      });

      // Resize observer / window resize
      let resizeDebounce;
      window.addEventListener('resize', () => {
        clearTimeout(resizeDebounce);
        resizeDebounce = setTimeout(() => {
          this.updateStep();
          this.track.style.transition = 'none';
          this.setTranslate(-this.currentIndex * this.step);
          this.track.offsetHeight;
          this.track.style.transition = '';
        }, 100);
      });
    }
  }

  // Self initialize when DOM is ready or view is mounted
  function initFitFuelHeroCarousel() {
    if (document.getElementById('heroCarouselTrack')) {
      if (!window.fitfuelHeroCarousel) {
        window.fitfuelHeroCarousel = new HeroCarousel();
      } else {
        // Update dimensions and resume autoplay if on today view
        window.fitfuelHeroCarousel.updateStep();
        window.fitfuelHeroCarousel.startAutoplay();
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFitFuelHeroCarousel);
  } else {
    initFitFuelHeroCarousel();
  }

  window.initFitFuelHeroCarousel = initFitFuelHeroCarousel;
})();

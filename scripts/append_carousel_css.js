const fs = require('fs');

const carouselCss = `
/* ==========================================================================
   FITFUEL HERO IMAGE CAROUSEL COMPONENT
   ========================================================================== */
.hero-carousel-container {
  width: 100%;
  max-width: 100%;
  margin: 0 0 24px 0;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

.hero-carousel-wrapper {
  position: relative;
  width: 100%;
  box-sizing: border-box;
}

.hero-carousel-viewport {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 20px;
  box-sizing: border-box;
  outline: none;
}

.hero-carousel-viewport:focus-visible {
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.45);
}

.hero-carousel-track {
  display: flex;
  align-items: stretch;
  gap: 18px;
  will-change: transform;
  transition: transform 0.55s cubic-bezier(0.25, 1, 0.5, 1);
  box-sizing: border-box;
}

/* Slide sizing: Desktop shows 2 large images + peek of 3rd */
.hero-carousel-slide {
  flex: 0 0 calc(47.5% - 9px);
  min-width: 0;
  box-sizing: border-box;
}

.hero-carousel-card {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 10px 25px -8px rgba(0, 0, 0, 0.25);
  background: var(--ff-glass-bg, rgba(255, 255, 255, 0.5));
  border: 1px solid var(--ff-glass-border, rgba(255, 255, 255, 0.18));
  box-sizing: border-box;
  transition: transform 0.28s ease, box-shadow 0.28s ease;
}

.hero-carousel-slide:hover .hero-carousel-card {
  transform: translateY(-2px);
  box-shadow: 0 14px 30px -8px rgba(0, 0, 0, 0.32);
}

.hero-carousel-img {
  width: 100%;
  height: clamp(240px, 28vw, 380px);
  aspect-ratio: 16 / 9;
  object-fit: cover;
  object-position: center;
  display: block;
  border-radius: 18px;
  user-select: none;
  -webkit-user-drag: none;
}

/* Navigation Arrow Controls */
.hero-carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  color: #0f172a;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
}

.hero-carousel-arrow:hover {
  transform: translateY(-50%) scale(1.08);
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);
}

.hero-carousel-arrow:active {
  transform: translateY(-50%) scale(0.96);
}

.hero-carousel-arrow:focus-visible {
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.45);
}

.hero-carousel-arrow.prev {
  left: 14px;
}

.hero-carousel-arrow.next {
  right: 14px;
}

/* Dark theme arrow styling */
html.dark .hero-carousel-arrow,
[data-theme="dark"] .hero-carousel-arrow {
  background: rgba(15, 23, 42, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #f8fafc;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45);
}

html.dark .hero-carousel-arrow:hover,
[data-theme="dark"] .hero-carousel-arrow:hover {
  background: rgba(30, 41, 59, 0.92);
  border-color: rgba(255, 255, 255, 0.3);
}

/* Pagination Dots */
.hero-carousel-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
}

.hero-carousel-dot {
  width: 8px;
  height: 8px;
  padding: 0;
  border-radius: 99px;
  border: none;
  background: rgba(148, 163, 184, 0.38);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
}

.hero-carousel-dot:hover {
  background: rgba(148, 163, 184, 0.7);
  transform: scale(1.15);
}

.hero-carousel-dot:focus-visible {
  box-shadow: 0 0 0 2px #2563eb;
}

.hero-carousel-dot.active {
  width: 26px;
  background: #2563eb;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.4);
}

html.dark .hero-carousel-dot.active,
[data-theme="dark"] .hero-carousel-dot.active {
  background: #38bdf8;
  box-shadow: 0 2px 8px rgba(56, 189, 248, 0.45);
}

/* Responsive: Tablet (769px - 1024px) */
@media (max-width: 1024px) {
  .hero-carousel-slide {
    flex: 0 0 calc(68% - 9px);
  }
  .hero-carousel-img {
    height: clamp(220px, 32vw, 320px);
  }
}

/* Responsive: Mobile (<= 768px) */
@media (max-width: 768px) {
  .hero-carousel-track {
    gap: 12px;
  }
  .hero-carousel-slide {
    flex: 0 0 calc(88% - 6px);
  }
  .hero-carousel-img {
    height: clamp(190px, 52vw, 260px);
    border-radius: 16px;
  }
  .hero-carousel-arrow {
    width: 38px;
    height: 38px;
  }
  .hero-carousel-arrow.prev {
    left: 8px;
  }
  .hero-carousel-arrow.next {
    right: 8px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-carousel-track {
    transition: none !important;
  }
  .hero-carousel-arrow,
  .hero-carousel-dot,
  .hero-carousel-card {
    transition: none !important;
  }
}
`;

fs.appendFileSync('public/styles.css', '\r\n' + carouselCss, 'utf8');
console.log('✔ Appended hero carousel styles to public/styles.css');

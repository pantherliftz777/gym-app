const fs = require('fs');

let html = fs.readFileSync('public/index.html', 'utf8');

const sIdx = html.indexOf('<div class="stronger-you-hero-card">');
const eMarker = '<!-- IMAGE 3: TOP GREETING & DATE FILTER BAR -->';
const eIdx = html.indexOf(eMarker);

if (sIdx === -1 || eIdx === -1) {
  console.error('Could not find stronger-you-hero-card or eMarker in public/index.html!');
  process.exit(1);
}

const carouselHtml = `<!-- ================= HERO IMAGE CAROUSEL SECTION ================= -->
        <div class="hero-carousel-container" id="heroCarouselContainer">
          <div class="hero-carousel-wrapper" id="heroCarouselWrapper">
            <div class="hero-carousel-viewport" id="heroCarouselViewport" tabindex="0" role="region" aria-roledescription="carousel" aria-label="FitFuel Feature Highlights">
              <div class="hero-carousel-track" id="heroCarouselTrack">
                <!-- Seamless Loop Clones Before: Slide 3 & 4 -->
                <div class="hero-carousel-slide clone" data-index="2" aria-hidden="true">
                  <div class="hero-carousel-card">
                    <img src="assets/hero-carousel/hero-03.png" alt="Daily workout, activity tracking and progress" class="hero-carousel-img" width="1200" height="675" loading="lazy">
                  </div>
                </div>
                <div class="hero-carousel-slide clone" data-index="3" aria-hidden="true">
                  <div class="hero-carousel-card">
                    <img src="assets/hero-carousel/hero-04.png" alt="Muscle activation, exercise tracking and training" class="hero-carousel-img" width="1200" height="675" loading="lazy">
                  </div>
                </div>

                <!-- Real Slide 1: Wellness, meditation, sleep and daily activity -->
                <div class="hero-carousel-slide" data-index="0" role="group" aria-roledescription="slide" aria-label="Slide 1 of 4: Wellness, meditation, sleep and daily activity">
                  <div class="hero-carousel-card">
                    <img src="assets/hero-carousel/hero-01.png" alt="Wellness, meditation, sleep and daily activity" class="hero-carousel-img" width="1200" height="675">
                  </div>
                </div>

                <!-- Real Slide 2: Workout, body analysis and nutrition -->
                <div class="hero-carousel-slide" data-index="1" role="group" aria-roledescription="slide" aria-label="Slide 2 of 4: Workout, body analysis and nutrition">
                  <div class="hero-carousel-card">
                    <img src="assets/hero-carousel/hero-02.png" alt="Workout, body analysis and nutrition" class="hero-carousel-img" width="1200" height="675">
                  </div>
                </div>

                <!-- Real Slide 3: Daily workout, activity tracking and progress -->
                <div class="hero-carousel-slide" data-index="2" role="group" aria-roledescription="slide" aria-label="Slide 3 of 4: Daily workout, activity tracking and progress">
                  <div class="hero-carousel-card">
                    <img src="assets/hero-carousel/hero-03.png" alt="Daily workout, activity tracking and progress" class="hero-carousel-img" width="1200" height="675" loading="lazy">
                  </div>
                </div>

                <!-- Real Slide 4: Muscle activation, exercise tracking and training -->
                <div class="hero-carousel-slide" data-index="3" role="group" aria-roledescription="slide" aria-label="Slide 4 of 4: Muscle activation, exercise tracking and training">
                  <div class="hero-carousel-card">
                    <img src="assets/hero-carousel/hero-04.png" alt="Muscle activation, exercise tracking and training" class="hero-carousel-img" width="1200" height="675" loading="lazy">
                  </div>
                </div>

                <!-- Seamless Loop Clones After: Slide 1, 2, 3, 4 -->
                <div class="hero-carousel-slide clone" data-index="0" aria-hidden="true">
                  <div class="hero-carousel-card">
                    <img src="assets/hero-carousel/hero-01.png" alt="Wellness, meditation, sleep and daily activity" class="hero-carousel-img" width="1200" height="675">
                  </div>
                </div>
                <div class="hero-carousel-slide clone" data-index="1" aria-hidden="true">
                  <div class="hero-carousel-card">
                    <img src="assets/hero-carousel/hero-02.png" alt="Workout, body analysis and nutrition" class="hero-carousel-img" width="1200" height="675">
                  </div>
                </div>
                <div class="hero-carousel-slide clone" data-index="2" aria-hidden="true">
                  <div class="hero-carousel-card">
                    <img src="assets/hero-carousel/hero-03.png" alt="Daily workout, activity tracking and progress" class="hero-carousel-img" width="1200" height="675" loading="lazy">
                  </div>
                </div>
                <div class="hero-carousel-slide clone" data-index="3" aria-hidden="true">
                  <div class="hero-carousel-card">
                    <img src="assets/hero-carousel/hero-04.png" alt="Muscle activation, exercise tracking and training" class="hero-carousel-img" width="1200" height="675" loading="lazy">
                  </div>
                </div>
              </div>

              <!-- Previous & Next Arrow Controls -->
              <button type="button" class="hero-carousel-arrow prev" id="heroCarouselPrevBtn" aria-label="Previous slide" title="Previous slide">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <button type="button" class="hero-carousel-arrow next" id="heroCarouselNextBtn" aria-label="Next slide" title="Next slide">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>

            <!-- Pagination Dots -->
            <div class="hero-carousel-pagination" id="heroCarouselPagination" role="tablist" aria-label="Slides pagination">
              <button type="button" class="hero-carousel-dot active" data-slide-index="0" role="tab" aria-selected="true" aria-label="Slide 1: Wellness &amp; Activity"></button>
              <button type="button" class="hero-carousel-dot" data-slide-index="1" role="tab" aria-selected="false" aria-label="Slide 2: Workout &amp; Nutrition"></button>
              <button type="button" class="hero-carousel-dot" data-slide-index="2" role="tab" aria-selected="false" aria-label="Slide 3: Daily Tracking"></button>
              <button type="button" class="hero-carousel-dot" data-slide-index="3" role="tab" aria-selected="false" aria-label="Slide 4: Muscle Activation"></button>
            </div>
          </div>
        </div>

        `;

html = html.substring(0, sIdx) + carouselHtml + html.substring(eIdx);

// Add preload link in head if not present
if (!html.includes('href="assets/hero-carousel/hero-01.png"')) {
  const headEndIdx = html.indexOf('</head>');
  const preloadTag = '  <link rel="preload" as="image" href="assets/hero-carousel/hero-01.png">\r\n';
  html = html.substring(0, headEndIdx) + preloadTag + html.substring(headEndIdx);
}

// Add script tag for hero-carousel.js before </body>
if (!html.includes('src="modules/hero-carousel.js"')) {
  const scriptTag = '  <script src="modules/hero-carousel.js?v=7.7.0"></script>\r\n';
  const bodyEndIdx = html.indexOf('</body>');
  html = html.substring(0, bodyEndIdx) + scriptTag + html.substring(bodyEndIdx);
}

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('✔ Replaced old hero section with new hero carousel in public/index.html');

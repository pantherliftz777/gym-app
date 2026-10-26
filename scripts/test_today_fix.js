const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

const targetStr = `                <svg class="sy-bcard-wave" viewBox="0 0 160 36" fill="none">
                  <path d="M0 24 C 40 28, 80 12, 120 24 C 140 28, 150 16, 160 18" stroke="#0284c7" stroke-width="2.8" stroke-linecap="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>`;

// What is the replacement without the extra </div>:
const fixedStr = `                <svg class="sy-bcard-wave" viewBox="0 0 160 36" fill="none">
                  <path d="M0 24 C 40 28, 80 12, 120 24 C 140 28, 150 16, 160 18" stroke="#0284c7" stroke-width="2.8" stroke-linecap="round"/>
                </svg>
              </div>
            </div>
          </div>`;

console.log('Includes targetStr:', html.includes(targetStr));

const fs = require('fs');
const path = require('path');

const targetFiles = [
  'gym-app/public/index.html',
  'gym-app/public/product.html',
  'gym-app/public/pricing.html',
  'gym-app/public/styles.css',
  'gym-app/public/app.js',
  'gym-app/public/dashboard.html',
  'gym-app/public/modules/landing-controller.js',
  'gym-app/public/fitusion-landing.css',
  'gym-app/public/fitusion-landing.js'
];

targetFiles.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Replace Fi<span>Tusion</span> with Fit<span>Fuel</span>
  content = content.replace(/Fi<span>Tusion<\/span>/g, 'Fit<span>Fuel</span>');
  content = content.replace(/Fi<span class="brand-accent">Tusion<\/span>/g, 'Fit<span class="brand-accent">Fuel</span>');
  
  // Replace FiTusion with FitFuel
  content = content.replace(/FiTusion/g, 'FitFuel');
  // Replace Fitusion with FitFuel
  content = content.replace(/Fitusion/g, 'FitFuel');
  // Replace fitusion with fitfuel (except in image paths if they still reference fitusion_exact, or let's check)
  // Let's replace 'fitusion' brand references
  content = content.replace(/window\.openFiTusionAuth/g, 'window.openFitFuelAuth');
  content = content.replace(/window\.closeFiTusionAuth/g, 'window.closeFitFuelAuth');

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Updated brand name in: ${file}`);
});

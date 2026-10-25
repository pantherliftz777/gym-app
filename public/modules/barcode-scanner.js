/* FitFuel Barcode Scanner with OpenFoodFacts API */
(function() {
  'use strict';

  let videoStream = null;
  let scanInterval = null;
  let detector = null;

  async function initDetector() {
    if ('BarcodeDetector' in window) {
      try {
        const supported = await BarcodeDetector.getSupportedFormats();
        if (supported.length > 0) {
          detector = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'qr_code', 'code_128'] });
        }
      } catch (e) {
        console.warn('[FitFuel Barcode] BarcodeDetector init error:', e);
      }
    }
  }

  async function fetchProductByBarcode(barcode) {
    const cleanCode = String(barcode).trim().replace(/\s+/g, '');
    if (!cleanCode) throw new Error('Please enter a valid barcode number.');

    const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(cleanCode)}.json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Product not found in OpenFoodFacts database.');

    const data = await res.json();
    if (data.status !== 1 || !data.product) {
      throw new Error('Product not found in database. You can still add it manually.');
    }

    const p = data.product;
    const nutriments = p.nutriments || {};

    const name = p.product_name || p.product_name_en || p.generic_name || 'Scanned Food';
    const brand = p.brands ? ` (${p.brands})` : '';
    const calories = Math.round(nutriments['energy-kcal_100g'] || (nutriments['energy_100g'] ? nutriments['energy_100g'] / 4.184 : 0));
    const protein = Math.round((nutriments['proteins_100g'] || 0) * 10) / 10;
    const carbs = Math.round((nutriments['carbohydrates_100g'] || 0) * 10) / 10;
    const fats = Math.round((nutriments['fat_100g'] || 0) * 10) / 10;
    const serving = p.serving_size || '100g';

    return {
      barcode: cleanCode,
      name: `${name}${brand}`,
      calories: calories || 100,
      protein: protein || 0,
      carbs: carbs || 0,
      fats: fats || 0,
      serving: serving,
      imageUrl: p.image_url || null
    };
  }

  async function startScanner(videoEl, onDetected) {
    await initDetector();

    try {
      videoStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      videoEl.srcObject = videoStream;
      await videoEl.play();

      if (detector) {
        scanInterval = setInterval(async () => {
          if (!videoEl || videoEl.readyState < 2) return;
          try {
            const barcodes = await detector.detect(videoEl);
            if (barcodes && barcodes.length > 0) {
              const code = barcodes[0].rawValue;
              if (code) {
                stopScanner(videoEl);
                if (onDetected) onDetected(code);
              }
            }
          } catch (err) {}
        }, 400);
      }
    } catch (err) {
      console.warn('[FitFuel Barcode] Camera access error:', err);
      throw err;
    }
  }

  function stopScanner(videoEl) {
    if (scanInterval) {
      clearInterval(scanInterval);
      scanInterval = null;
    }
    if (videoStream) {
      videoStream.getTracks().forEach(t => t.stop());
      videoStream = null;
    }
    if (videoEl) {
      videoEl.srcObject = null;
    }
  }

  if (typeof window !== 'undefined') {
    window.FitFuelBarcode = {
      fetchProductByBarcode,
      startScanner,
      stopScanner,
      hasNativeDetector: () => 'BarcodeDetector' in window
    };
  }
})();

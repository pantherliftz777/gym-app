async function fetchDribbble() {
  try {
    const res = await fetch('https://dribbble.com/shots/25337726-Fitness-Website-Design', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const text = await res.text();
    const ogImg = text.match(/property="og:image"\s+content="([^"]+)"/i);
    const ogTitle = text.match(/property="og:title"\s+content="([^"]+)"/i);
    const ogDesc = text.match(/property="og:description"\s+content="([^"]+)"/i);
    console.log('OG Title:', ogTitle ? ogTitle[1] : 'N/A');
    console.log('OG Desc:', ogDesc ? ogDesc[1] : 'N/A');
    console.log('OG Image:', ogImg ? ogImg[1] : 'N/A');
    
    // Find all media URLs
    const mediaMatches = [...text.matchAll(/https:\/\/cdn\.dribbble\.com\/userupload\/[a-zA-Z0-9_\-\.\/]+/g)].map(m => m[0]);
    console.log('Media count:', mediaMatches.length);
    console.log('Top media URLs:', [...new Set(mediaMatches)].slice(0, 5));
  } catch (err) {
    console.error('Fetch error:', err);
  }
}
fetchDribbble();

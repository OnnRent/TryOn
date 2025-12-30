// Test ScraperAPI scraper
require('dotenv').config();
const scrapeProductImagesScraperAPI = require('./scrapeProductImagesScraperAPI');

const testUrl = process.argv[2] || 'https://www.flipkart.com/kajaru-self-design-men-polo-neck-blue-white-t-shirt/p/itm0194446c963e8?pid=TSHHEW4UGZDM3UZH';

console.log('🧪 Testing ScraperAPI scraper');
console.log('URL:', testUrl);
console.log('');

// Check if API key is set
if (!process.env.SCRAPER_API_KEY) {
  console.error('❌ ERROR: SCRAPER_API_KEY not found in environment variables');
  console.log('');
  console.log('To fix this:');
  console.log('1. Sign up at: https://www.scraperapi.com/signup');
  console.log('2. Get your API key from the dashboard');
  console.log('3. Add to Backend/.env: SCRAPER_API_KEY=your_key_here');
  console.log('4. Run this test again');
  process.exit(1);
}

console.log('✅ API Key found:', process.env.SCRAPER_API_KEY.substring(0, 10) + '...');
console.log('');

scrapeProductImagesScraperAPI(testUrl)
  .then(images => {
    console.log('');
    console.log('✅ SUCCESS!');
    console.log(`Found ${images.length} images:`);
    images.forEach((img, i) => {
      console.log(`${i + 1}. ${img}`);
    });
    console.log('');
    console.log('💰 This request used 1 API credit');
    console.log('📊 Check usage at: https://www.scraperapi.com/dashboard');
    process.exit(0);
  })
  .catch(err => {
    console.log('');
    console.log('❌ ERROR:', err.message);
    console.log('');
    
    if (err.message.includes('Invalid ScraperAPI key')) {
      console.log('🔧 Fix: Check your SCRAPER_API_KEY in .env file');
    } else if (err.message.includes('rate limit')) {
      console.log('🔧 Fix: You\'ve exceeded your monthly limit. Upgrade or wait.');
    } else {
      console.log('Stack:', err.stack);
    }
    
    process.exit(1);
  });


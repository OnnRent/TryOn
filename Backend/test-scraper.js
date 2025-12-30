// Test script to debug scraping issues
const scrapeProductImages = require('./scrapeProductImages');

const testUrl = process.argv[2] || 'https://dl.flipkart.com/s/vXo8vUNNNN';

console.log('🧪 Testing scraper with URL:', testUrl);
console.log('');

scrapeProductImages(testUrl)
  .then(images => {
    console.log('');
    console.log('✅ SUCCESS!');
    console.log(`Found ${images.length} images:`);
    images.forEach((img, i) => {
      console.log(`${i + 1}. ${img}`);
    });
    process.exit(0);
  })
  .catch(err => {
    console.log('');
    console.log('❌ ERROR:', err.message);
    console.log('');
    console.log('Stack:', err.stack);
    process.exit(1);
  });


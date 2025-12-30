/**
 * Test script for the improved Puppeteer-based scraper
 * 
 * Usage: node test_scraper.js
 */

const scrapeProductImages = require('./scrapeProductImages');

async function testScraper() {
  console.log("🧪 Testing Product Image Scraper\n");

  // Test URLs from different e-commerce sites
  const testUrls = [
    {
      name: "Flipkart T-Shirt (Current Test)",
      url: "https://www.flipkart.com/kajaru-solid-men-zip-neck-black-t-shirt/p/itmccf4be686542f?pid=TSHHHCXFP8MMYWBN&lid=LSTTSHHHCXFP8MMYWBNTIE2MI&marketplace=FLIPKART&q=tshirt+for+men&store=clo%2Fash%2Fank%2Fedy&srno=s_1_1&otracker=AS_QueryStore_OrganicAutoSuggest_2_3_na_na_na&otracker1=AS_QueryStore_OrganicAutoSuggest_2_3_na_na_na&fm=search-autosuggest&iid=en_JmGicmhgOsY-nb3tNMDjdwn6DjxNcdDAs3ImO1yqJRF1nQwHUEvdZg6-7KOwF3prICqcvuHHxqVaExse2n8b7Q%3D%3D&ppt=sp&ppn=sp&ssid=4gk799h29s0000001767082770496&qH=772b81288fbe5b81"
    },
    {
      name: "Flipkart Jumpsuit",
      url: "https://www.flipkart.com/prettyplus-desinoor-solid-women-jumpsuit/p/itmeb993b81e0d57?pid=JUMGZ66KNZQPVG7X"
    }
  ];

  for (const test of testUrls) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing: ${test.name}`);
    console.log(`URL: ${test.url}`);
    console.log('='.repeat(60));

    try {
      const startTime = Date.now();
      const images = await scrapeProductImages(test.url);
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      console.log(`\n✅ SUCCESS! Found ${images.length} images in ${duration}s\n`);
      
      images.forEach((img, index) => {
        console.log(`Image ${index + 1}:`);
        console.log(`  ${img}`);
        console.log();
      });

    } catch (error) {
      console.error(`\n❌ FAILED: ${error.message}\n`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("Test completed!");
  console.log("=".repeat(60) + "\n");
}

// Run the test
testScraper()
  .then(() => {
    console.log("✅ All tests completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });


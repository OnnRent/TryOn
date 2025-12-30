// Use ScraperAPI only - simple and reliable
const scrapeProductImagesScraperAPI = require("./scrapeProductImagesScraperAPI");

module.exports = async function scrapeProductImages(url) {
  console.log("🔍 Scraping images from:", url);

  // Check if ScraperAPI key is set
  if (!process.env.SCRAPER_API_KEY) {
    throw new Error("SCRAPER_API_KEY not found. Please add it to your environment variables.");
  }

  console.log("🔄 Using ScraperAPI for scraping...");

  try {
    return await scrapeProductImagesScraperAPI(url);
  } catch (error) {
    console.error("❌ ScraperAPI failed:", error.message);
    throw new Error(`Failed to scrape product images: ${error.message}`);
  }
};
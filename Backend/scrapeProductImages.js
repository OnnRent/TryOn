const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async function scrapeProductImages(url) {
  console.log("🔍 Scraping images from:", url);

  try {
    const { data: html } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      timeout: 10000, // 10 second timeout
    });

    const $ = cheerio.load(html);
    const images = new Set();

    // Priority selectors for common e-commerce sites
    const selectors = [
      // Amazon
      '#landingImage',
      '#imgTagWrapperId img',
      '.a-dynamic-image',

      // Flipkart
      '._396cs4._2amPTt img',
      '._2r_T1I img',

      // Myntra
      '.image-grid-image',
      '.image-grid-imageContainer img',

      // Generic product images
      '[data-testid="product-image"]',
      '.product-image img',
      '.product-gallery img',
      '[class*="product"] img[src*="jpg"]',
      '[class*="product"] img[src*="jpeg"]',
      '[class*="product"] img[src*="png"]',

      // Open Graph images (fallback)
      'meta[property="og:image"]',
    ];

    // Try priority selectors first
    for (const selector of selectors) {
      if (selector.startsWith('meta')) {
        const content = $(selector).attr('content');
        if (content && content.startsWith('http')) {
          images.add(cleanImageUrl(content));
        }
      } else {
        $(selector).each((_, elem) => {
          const src = $(elem).attr('src') ||
                     $(elem).attr('data-src') ||
                     $(elem).attr('data-original') ||
                     $(elem).attr('data-zoom-image');

          if (src && src.startsWith('http')) {
            images.add(cleanImageUrl(src));
          }
        });
      }

      if (images.size >= 2) break;
    }

    // If still not enough, try all images
    if (images.size < 2) {
      console.log("⚠️ Not enough images from priority selectors, trying all images...");
      $("img").each((_, img) => {
        const src = $(img).attr("src") ||
                   $(img).attr("data-src") ||
                   $(img).attr("data-original");

        if (src && src.startsWith("http") && isProductImage(src)) {
          images.add(cleanImageUrl(src));
        }
      });
    }

    const imageArray = Array.from(images)
      .filter(url => url.length > 20) // Filter out tiny/icon images
      .slice(0, 2);

    console.log(`✅ Found ${imageArray.length} product images`);
    return imageArray;

  } catch (error) {
    console.error("❌ Scraping error:", error.message);
    throw new Error("Failed to scrape product images. Please check the URL and try again.");
  }
};

// Clean image URL (remove query params, get high-res version)
function cleanImageUrl(url) {
  // Remove query parameters
  let cleaned = url.split('?')[0];

  // For Amazon, try to get larger image
  if (cleaned.includes('amazon')) {
    cleaned = cleaned.replace(/\._[A-Z0-9,_]+_\./, '.');
  }

  return cleaned;
}

// Check if URL looks like a product image (not logo, icon, etc.)
function isProductImage(url) {
  const lowerUrl = url.toLowerCase();

  // Exclude common non-product images
  const excludePatterns = [
    'logo', 'icon', 'sprite', 'banner', 'header', 'footer',
    'button', 'arrow', 'star', 'rating', 'badge', 'flag',
    'social', 'payment', 'trust', 'secure', '1x1', 'pixel'
  ];

  for (const pattern of excludePatterns) {
    if (lowerUrl.includes(pattern)) {
      return false;
    }
  }

  // Must be a reasonable image format
  return /\.(jpg|jpeg|png|webp)/.test(lowerUrl);
}

const puppeteer = require("puppeteer");

module.exports = async function scrapeProductImages(url) {
  console.log("🔍 Scraping images from:", url);

  let browser;
  try {
    // Launch headless browser
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080'
      ]
    });

    const page = await browser.newPage();

    // Set viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    console.log("📄 Loading page...");

    // Navigate to the page with timeout
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log("⏳ Waiting for images to load...");

    // Wait for images to appear (try multiple selectors)
    try {
      await Promise.race([
        page.waitForSelector('img[src*="rukmini"]', { timeout: 10000 }), // Flipkart
        page.waitForSelector('img[src*="images-amazon"]', { timeout: 10000 }), // Amazon
        page.waitForSelector('img[src*="assets.myntassets"]', { timeout: 10000 }), // Myntra
        page.waitForSelector('.product-image img', { timeout: 10000 }), // Generic
      ]);
    } catch (e) {
      console.log("⚠️ Specific selectors not found, trying generic approach...");
    }

    // Give extra time for lazy-loaded images
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log("🖼️ Extracting image URLs...");

    // Extract product images using multiple strategies
    const images = await page.evaluate(() => {
      const imageUrls = new Set();

      // Strategy 1: Look for high-quality product images by domain
      const productImageDomains = [
        'rukmini', // Flipkart
        'images-amazon', // Amazon
        'assets.myntassets', // Myntra
        'static.zara.net', // Zara
        'images.asos-media', // ASOS
      ];

      document.querySelectorAll('img').forEach(img => {
        const src = img.src || img.dataset.src || img.dataset.original;
        if (src && productImageDomains.some(domain => src.includes(domain))) {
          // Get high-res version
          let highResSrc = src;

          // Flipkart: Replace size parameters for higher quality
          if (src.includes('rukmini')) {
            highResSrc = src.replace(/\/\d+\/\d+\//, '/832/832/');
            highResSrc = highResSrc.split('?')[0] + '?q=90';
          }

          // Amazon: Get larger image
          if (src.includes('amazon')) {
            highResSrc = src.replace(/\._[A-Z0-9,_]+_\./, '.');
          }

          imageUrls.add(highResSrc);
        }
      });

      // Strategy 2: Check for Open Graph image
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage && ogImage.content) {
        imageUrls.add(ogImage.content);
      }

      // Strategy 3: Look for images in common product gallery containers
      const gallerySelectors = [
        '._396cs4 img', // Flipkart gallery
        '.image-grid-image', // Myntra
        '#landingImage', // Amazon
        '.product-gallery img',
        '[data-testid="product-image"]',
      ];

      gallerySelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(img => {
          const src = img.src || img.dataset.src;
          if (src && src.startsWith('http')) {
            imageUrls.add(src);
          }
        });
      });

      return Array.from(imageUrls);
    });

    await browser.close();

    // Filter and clean images
    const cleanedImages = images
      .filter(url => {
        // Filter out icons, logos, and small images
        const lowerUrl = url.toLowerCase();
        const excludePatterns = [
          'logo', 'icon', 'sprite', 'banner', 'header', 'footer',
          'button', 'arrow', 'star', 'rating', 'badge', 'flag',
          'social', 'payment', 'trust', 'secure', '1x1', 'pixel',
          'thumbnail', 'thumb', 'small'
        ];

        return !excludePatterns.some(pattern => lowerUrl.includes(pattern));
      })
      .filter(url => url.length > 30) // Filter out very short URLs
      .slice(0, 4); // Get up to 4 images

    console.log(`✅ Found ${cleanedImages.length} product images`);

    if (cleanedImages.length === 0) {
      throw new Error("No product images found on the page");
    }

    return cleanedImages;

  } catch (error) {
    if (browser) {
      await browser.close();
    }
    console.error("❌ Scraping error:", error.message);
    throw new Error("Failed to scrape product images. Please check the URL and try again.");
  }
};
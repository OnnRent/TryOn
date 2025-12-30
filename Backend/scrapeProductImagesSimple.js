// Simple scraper using axios + cheerio (works on Vercel)
const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async function scrapeProductImagesSimple(url) {
  console.log("🔍 Scraping images from:", url);

  try {
    // Fetch the HTML
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 30000,
      maxRedirects: 5
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const imageUrls = new Set();

    // Strategy 1: Look for Flipkart product images
    $('img').each((i, elem) => {
      const src = $(elem).attr('src') || $(elem).attr('data-src') || $(elem).attr('data-original');
      
      if (src && src.includes('rukmini')) {
        // Get high-res version
        let highResSrc = src.replace(/\/\d+\/\d+\//, '/832/832/');
        highResSrc = highResSrc.split('?')[0] + '?q=90';
        imageUrls.add(highResSrc);
      }
    });

    // Strategy 2: Look for Open Graph image
    const ogImage = $('meta[property="og:image"]').attr('content');
    if (ogImage) {
      imageUrls.add(ogImage);
    }

    // Strategy 3: Look in script tags for image data
    $('script').each((i, elem) => {
      const scriptContent = $(elem).html();
      if (scriptContent && scriptContent.includes('rukmini')) {
        // Extract image URLs from JSON data
        const matches = scriptContent.match(/https:\/\/rukminim[^"'\s]+/g);
        if (matches) {
          matches.forEach(match => {
            if (match.includes('.jpeg') || match.includes('.jpg') || match.includes('.png')) {
              let cleanUrl = match.replace(/\\"/g, '').replace(/\\/g, '');
              // Upgrade to high-res
              cleanUrl = cleanUrl.replace(/\/\d+\/\d+\//, '/832/832/');
              cleanUrl = cleanUrl.split('?')[0] + '?q=90';
              imageUrls.add(cleanUrl);
            }
          });
        }
      }
    });

    // Convert to array and filter
    const images = Array.from(imageUrls)
      .filter(url => {
        const lowerUrl = url.toLowerCase();
        const excludePatterns = [
          'logo', 'icon', 'sprite', 'banner', 'header', 'footer',
          'button', 'arrow', 'star', 'rating', 'badge', 'flag',
          'social', 'payment', 'trust', 'secure', '1x1', 'pixel'
        ];
        return !excludePatterns.some(pattern => lowerUrl.includes(pattern));
      })
      .slice(0, 4);

    console.log(`✅ Found ${images.length} product images`);

    if (images.length > 0) {
      console.log(`📸 First image: ${images[0].substring(0, 100)}...`);
    }

    if (images.length === 0) {
      throw new Error("No product images found. The page structure might have changed.");
    }

    return images;

  } catch (error) {
    console.error("❌ Simple scraping error:", error.message);
    throw new Error(`Failed to scrape product images: ${error.message}`);
  }
};


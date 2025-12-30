// ScraperAPI-based scraper (premium, works on Vercel)
const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async function scrapeProductImagesScraperAPI(url) {
  console.log("🔍 Scraping with ScraperAPI:", url);

  const apiKey = process.env.SCRAPER_API_KEY;

  if (!apiKey) {
    throw new Error("SCRAPER_API_KEY not found in environment variables");
  }

  try {
    // Make request through ScraperAPI
    const response = await axios.get('http://api.scraperapi.com/', {
      params: {
        api_key: apiKey,
        url: url,
        render: true, // Enable JavaScript rendering
        country_code: 'in', // Use Indian proxy for Flipkart
        premium: false, // Set to true for residential proxies (costs more)
        session_number: Math.floor(Math.random() * 1000) // Random session
      },
      timeout: 60000 // ScraperAPI can take longer
    });

    console.log("✅ ScraperAPI response received");

    const html = response.data;
    const $ = cheerio.load(html);

    const imageUrls = new Set();

    // Strategy 1: Look for Flipkart product images
    $('img').each((_, elem) => {
      const src = $(elem).attr('src') || $(elem).attr('data-src') || $(elem).attr('data-original');
      
      if (src && src.includes('rukmini')) {
        // Get high-res version
        let highResSrc = src.replace(/\/\d+\/\d+\//, '/832/832/');
        highResSrc = highResSrc.split('?')[0] + '?q=90';
        imageUrls.add(highResSrc);
      }
    });

    // Strategy 2: Look for Amazon images
    $('img').each((_, elem) => {
      const src = $(elem).attr('src') || $(elem).attr('data-src');
      
      if (src && src.includes('images-amazon')) {
        imageUrls.add(src);
      }
    });

    // Strategy 3: Look for Myntra images
    $('img').each((_, elem) => {
      const src = $(elem).attr('src') || $(elem).attr('data-src');
      
      if (src && src.includes('assets.myntassets')) {
        imageUrls.add(src);
      }
    });

    // Strategy 4: Open Graph image
    const ogImage = $('meta[property="og:image"]').attr('content');
    if (ogImage) {
      imageUrls.add(ogImage);
    }

    // Strategy 5: Look in script tags for image data
    $('script').each((_, elem) => {
      const scriptContent = $(elem).html();
      if (scriptContent && (scriptContent.includes('rukmini') || scriptContent.includes('images-amazon'))) {
        // Extract image URLs from JSON data
        const matches = scriptContent.match(/https:\/\/[^"'\s]+\.(jpeg|jpg|png|webp)/gi);
        if (matches) {
          matches.forEach(match => {
            let cleanUrl = match.replace(/\\"/g, '').replace(/\\/g, '');
            // Upgrade Flipkart images to high-res
            if (cleanUrl.includes('rukmini')) {
              cleanUrl = cleanUrl.replace(/\/\d+\/\d+\//, '/832/832/');
              cleanUrl = cleanUrl.split('?')[0] + '?q=90';
            }
            imageUrls.add(cleanUrl);
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

    console.log(`✅ Found ${images.length} product images via ScraperAPI`);

    if (images.length > 0) {
      console.log(`📸 First image: ${images[0].substring(0, 100)}...`);
    }

    if (images.length === 0) {
      throw new Error("No product images found. The page structure might have changed.");
    }

    return images;

  } catch (error) {
    console.error("❌ ScraperAPI error:", error.message);
    
    // Provide helpful error messages
    if (error.response?.status === 401) {
      throw new Error("Invalid ScraperAPI key. Please check your SCRAPER_API_KEY environment variable.");
    } else if (error.response?.status === 429) {
      throw new Error("ScraperAPI rate limit exceeded. Please upgrade your plan or wait.");
    } else if (error.response?.status === 500) {
      throw new Error("ScraperAPI server error. The target website might be blocking requests.");
    }
    
    throw new Error(`ScraperAPI failed: ${error.message}`);
  }
};


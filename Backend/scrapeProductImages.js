const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async function scrapeProductImages(url) {
  const { data: html } = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });

  const $ = cheerio.load(html);

  const images = new Set();

  // Generic selectors (works for Flipkart, Amazon, etc.)
  $("img").each((_, img) => {
    const src =
      $(img).attr("src") ||
      $(img).attr("data-src") ||
      $(img).attr("data-original");

    if (src && src.startsWith("http")) {
      images.add(src.split("?")[0]);
    }
  });

  return Array.from(images).slice(0, 2);
};

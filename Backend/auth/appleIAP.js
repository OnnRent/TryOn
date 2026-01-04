const axios = require("axios");

// Apple IAP verification URLs
const APPLE_PRODUCTION_URL = "https://buy.itunes.apple.com/verifyReceipt";
const APPLE_SANDBOX_URL = "https://sandbox.itunes.apple.com/verifyReceipt";

// Product ID to tryons mapping
const PRODUCT_TRYONS = {
  "com.vanshkarnwal.tryon.basic": 15,
  "com.vanshkarnwal.tryon.pro": 25,
};

/**
 * Verify Apple IAP receipt with Apple's servers
 * @param {string} receiptData - Base64 encoded receipt data
 * @returns {Promise<object>} - Verified receipt info
 */
async function verifyAppleReceipt(receiptData) {
  const payload = {
    "receipt-data": receiptData,
    password: process.env.APPLE_SHARED_SECRET || "", // Optional for consumables
    "exclude-old-transactions": true,
  };

  try {
    // First try production
    let response = await axios.post(APPLE_PRODUCTION_URL, payload, {
      headers: { "Content-Type": "application/json" },
    });

    // Status 21007 means receipt is from sandbox, retry with sandbox URL
    if (response.data.status === 21007) {
      console.log("📱 Receipt is from sandbox, retrying...");
      response = await axios.post(APPLE_SANDBOX_URL, payload, {
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = response.data;

    // Check status codes
    // 0 = valid, 21007 = sandbox receipt sent to prod (handled above)
    // Other codes indicate errors
    if (data.status !== 0) {
      const errorMessages = {
        21000: "App Store could not read the JSON",
        21002: "Receipt data malformed",
        21003: "Receipt could not be authenticated",
        21004: "Shared secret mismatch",
        21005: "Receipt server unavailable",
        21006: "Receipt valid but subscription expired",
        21008: "Receipt is from production but sent to sandbox",
        21010: "Account not found",
      };
      throw new Error(errorMessages[data.status] || `Unknown error: ${data.status}`);
    }

    return data;
  } catch (error) {
    console.error("Apple receipt verification failed:", error.message);
    throw error;
  }
}

/**
 * Extract latest transaction from receipt
 * @param {object} receiptData - Verified receipt from Apple
 * @returns {object} - Latest transaction info
 */
function extractTransaction(receiptData) {
  const receipt = receiptData.receipt;
  const inAppPurchases = receipt.in_app || [];

  if (inAppPurchases.length === 0) {
    throw new Error("No in-app purchases found in receipt");
  }

  // Get the most recent transaction
  const latestTransaction = inAppPurchases.reduce((latest, current) => {
    const currentDate = parseInt(current.purchase_date_ms);
    const latestDate = latest ? parseInt(latest.purchase_date_ms) : 0;
    return currentDate > latestDate ? current : latest;
  }, null);

  return {
    transactionId: latestTransaction.transaction_id,
    originalTransactionId: latestTransaction.original_transaction_id,
    productId: latestTransaction.product_id,
    purchaseDate: new Date(parseInt(latestTransaction.purchase_date_ms)),
    quantity: parseInt(latestTransaction.quantity) || 1,
  };
}

/**
 * Get tryons count for a product ID
 * @param {string} productId - Apple product ID
 * @returns {number} - Number of tryons
 */
function getTryonsForProduct(productId) {
  const tryons = PRODUCT_TRYONS[productId];
  if (!tryons) {
    throw new Error(`Unknown product ID: ${productId}`);
  }
  return tryons;
}

module.exports = {
  verifyAppleReceipt,
  extractTransaction,
  getTryonsForProduct,
  PRODUCT_TRYONS,
};


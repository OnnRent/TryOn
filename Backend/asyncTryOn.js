// asyncTryOn.js - Background processing for virtual try-on
const { generateVirtualTryOn } = require("./geminiTryOn");
const AWS = require("aws-sdk");
const pool = require("./db");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

/**
 * Process a virtual try-on job asynchronously
 * @param {string} generatedImageId - The ID of the generated_images record
 */
async function processVirtualTryOn(generatedImageId) {
  const startTime = Date.now();
  
  try {
    console.log(`🔄 Processing virtual try-on job: ${generatedImageId}`);

    // 1. Get job details from database
    const jobResult = await pool.query(
      `SELECT 
        gi.id,
        gi.user_id,
        gi.person_image_path,
        gi.clothing_image_path,
        gi.prompt_used
       FROM generated_images gi
       WHERE gi.id = $1 AND gi.status = 'pending'`,
      [generatedImageId]
    );

    if (jobResult.rows.length === 0) {
      console.error(`❌ Job not found or already processed: ${generatedImageId}`);
      return;
    }

    const job = jobResult.rows[0];

    // 2. Update status to processing
    await pool.query(
      `UPDATE generated_images 
       SET status = 'processing', updated_at = NOW()
       WHERE id = $1`,
      [generatedImageId]
    );

    // 3. Get signed URLs for input images
    const personImageUrl = s3.getSignedUrl("getObject", {
      Bucket: process.env.S3BUCKETNAME,
      Key: job.person_image_path,
      Expires: 60 * 60, // 1 hour
    });

    const clothingImageUrl = s3.getSignedUrl("getObject", {
      Bucket: process.env.S3BUCKETNAME,
      Key: job.clothing_image_path,
      Expires: 60 * 60,
    });

    // 4. Generate virtual try-on using Gemini
    console.log(`🎨 Calling Gemini API for job: ${generatedImageId}`);
    const resultImageBuffer = await generateVirtualTryOn(
      personImageUrl,
      clothingImageUrl,
      job.prompt_used
    );

    // 5. Upload result to S3
    const resultKey = `generated/${job.user_id}/${Date.now()}-result.jpg`;
    await s3.putObject({
      Bucket: process.env.S3BUCKETNAME,
      Key: resultKey,
      Body: resultImageBuffer,
      ContentType: "image/jpeg",
    }).promise();

    console.log(`✅ Result uploaded to S3: ${resultKey}`);

    // 6. Update database with result
    const generationTime = Date.now() - startTime;
    await pool.query(
      `UPDATE generated_images 
       SET 
         result_image_path = $1,
         status = 'completed',
         generation_time_ms = $2,
         updated_at = NOW()
       WHERE id = $3`,
      [resultKey, generationTime, generatedImageId]
    );

    console.log(`✅ Virtual try-on completed in ${generationTime}ms`);
    return { success: true, resultKey, generationTime };

  } catch (error) {
    console.error(`❌ Error processing virtual try-on:`, error);

    // Update database with error
    await pool.query(
      `UPDATE generated_images 
       SET 
         status = 'failed',
         error_message = $1,
         updated_at = NOW()
       WHERE id = $2`,
      [error.message, generatedImageId]
    );

    return { success: false, error: error.message };
  }
}

module.exports = { processVirtualTryOn };


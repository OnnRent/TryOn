const AWS = require("aws-sdk");
const sharp = require("sharp");
const { Pool } = require("pg");
require("dotenv").config();

const s3 = new AWS.S3();

const pool = new Pool({
  user: "postgres",
  host: process.env.DBHOST,
  database: "wardrobe_db",
  password:process.env.DBPASSWORD,
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

exports.handler = async (event) => {
  const record = event.Records[0];
  const bucket = record.s3.bucket.name;
  const rawKey = decodeURIComponent(record.s3.object.key);
  if (!rawKey.startsWith("raw/")) return;
  console.log("Processing:", rawKey);

  // Example: raw/wardrobe/{itemId}/front.jpg
  const parts = rawKey.split("/");
  const wardrobeItemId = parts[2];
  const view = parts[3].split(".")[0];

  // 1️⃣ Download raw image
  const rawImage = await s3.getObject({
    Bucket: bucket,
    Key: rawKey
  }).promise();

  // 2️⃣ Resize + compress (WebP)
  const processedBuffer = await sharp(rawImage.Body)
    .resize(1024, 1024, { fit: "inside" })
    .webp({ quality: 80 })
    .toBuffer();

  const processedKey = `processed/wardrobe/${wardrobeItemId}/${view}.webp`;

  // 3️⃣ Upload processed image
  await s3.putObject({
    Bucket: bucket,
    Key: processedKey,
    Body: processedBuffer,
    ContentType: "image/webp"
  }).promise();

  // 4️⃣ Update Postgres
  await pool.query(
    `
    UPDATE wardrobe_images
    SET processed_path = $1, status = 'processed'
    WHERE wardrobe_item_id = $2 AND view = $3
    `,
    [processedKey, wardrobeItemId, view]
  );

  console.log("✅ Image processed:", processedKey);
};

module.exports = pool;

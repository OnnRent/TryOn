const { S3Client, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const sharp = require("sharp");
const { Pool } = require("pg");
require("dotenv").config();

const s3Client = new S3Client({
  region: process.env.AWSREGION || process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWSACCESSKEY || process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWSSECRETKEY || process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Helper function to convert stream to buffer
async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

// Use SSL for remote database connections (when DBHOST is set)
// Only skip SSL for localhost connections
const isLocalhost = !process.env.DBHOST ||
  process.env.DBHOST === "localhost" ||
  process.env.DBHOST === "127.0.0.1";

const pool = new Pool({
  user: "postgres",
  host: process.env.DBHOST,
  database: "wardrobe_db",
  password: process.env.DBPASSWORD,
  port: 5432,
  ssl: isLocalhost ? false : {
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
  const rawImageResponse = await s3Client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: rawKey,
    })
  );

  // Convert stream to buffer
  const rawImageBuffer = await streamToBuffer(rawImageResponse.Body);

  // 2️⃣ Resize + compress (WebP)
  const processedBuffer = await sharp(rawImageBuffer)
    .resize(1024, 1024, { fit: "inside" })
    .webp({ quality: 80 })
    .toBuffer();

  const processedKey = `processed/wardrobe/${wardrobeItemId}/${view}.webp`;

  // 3️⃣ Upload processed image
  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: processedKey,
      Body: processedBuffer,
      ContentType: "image/webp",
    })
  );

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

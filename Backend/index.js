const express = require("express");
const app = express();
// const { v4: uuidv4 } = require('uuid');
let uuidv4;
(async () => {
  const uuid = await import('uuid');
  uuidv4 = uuid.v4;
})();
const pool = require("./db");
const multer = require("multer");
const cors = require("cors");
require("dotenv").config();
const s3 = require("./s3");
const removeBackground = require("./removeBackground");
const scrapeProductImages = require("./scrapeProductImages");
const axios = require("axios");
const { verifyAppleToken } = require("./auth/apple");
const { createToken, verifyToken } = require("./auth/jwt");



app.use(cors({
  origin: "*"
}));

app.use(express.json());

if (process.env.NODE_ENV !== "production") {
  app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
  });
}


app.get("/", (req, res) => {
  res.json({ status: "OK", message: "TryOn API is running" });
});


app.post("/auth/apple", async (req, res) => {
  try {
    const { identityToken } = req.body;

    const appleUser = await verifyAppleToken(identityToken);
    const appleUserId = appleUser.sub;
    const email = appleUser.email || null;

    let user = await pool.query(
      "SELECT id FROM users WHERE apple_user_id = $1",
      [appleUserId]
    );

    if (user.rows.length === 0) {
      user = await pool.query(
        `
        INSERT INTO users (id, apple_user_id, email)
        VALUES ($1, $2, $3)
        RETURNING id
        `,
        [uuidv4(), appleUserId, email]
      );
    }

    const token = createToken(user.rows[0].id);

    res.json({ token });

  } catch (err) {
    console.error("APPLE AUTH ERROR:", err);
    res.status(401).json({ error: "Authentication failed" });
  }
});

app.post("/wardrobe/item", verifyToken, async (req, res) => {

  try {
    const { category } = req.body;
    const id = uuidv4();

    console.log("I am here");

    await pool.query(
        `
        INSERT INTO wardrobe_items (id, user_id, category)
        VALUES ($1, $2, $3)
        `,
        [id, req.userId, category]
        );

    console.log("Waiting");

    res.json({ wardrobe_item_id: id });
  } catch (err) {
    console.error("DB ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});



// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   }
// });

// const upload = multer({ storage });
const upload = multer({
  storage: multer.memoryStorage()
});


app.post(
  "/wardrobe/image",
  verifyToken,
  upload.fields([
    { name: "front", maxCount: 1 },
    { name: "back", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      console.log("📥 Received upload request");
      console.log("Body:", req.body);
      console.log("Files:", req.files);

      const { wardrobe_item_id } = req.body;

      if (!wardrobe_item_id) {
        console.error("❌ Missing wardrobe_item_id");
        return res.status(400).json({ error: "wardrobe_item_id is required" });
      }

      const frontFile = req.files?.front?.[0];
      const backFile = req.files?.back?.[0];

      console.log("Front file:", frontFile ? "✅" : "❌");
      console.log("Back file:", backFile ? "✅" : "❌");

      if (!frontFile || !backFile) {
        console.error("❌ Missing images - front:", !!frontFile, "back:", !!backFile);
        return res.status(400).json({
          error: "Both front and back images are required",
        });
      }

      // 🔴 VERIFY OWNERSHIP FIRST
      const owner = await pool.query(
        `SELECT 1 FROM wardrobe_items WHERE id = $1 AND user_id = $2`,
        [wardrobe_item_id, req.userId]
      );

      if (owner.rows.length === 0) {
        console.error("❌ Unauthorized - item doesn't belong to user");
        return res.status(403).json({ error: "Unauthorized" });
      }

      // 🔴 CHECK IF ALREADY EXISTS
      const existing = await pool.query(
        `
        SELECT view,
            COALESCE(processed_path, raw_path) AS file_path,
            status
        FROM wardrobe_images
        WHERE wardrobe_item_id = $1
        `,
        [wardrobe_item_id]
      );

      if (existing.rows.length > 0) {
        console.error("❌ Images already exist for this item");
        return res.status(400).json({
          error: "Images already uploaded for this item",
        });
      }

      console.log("✅ Starting upload for both images...");

      // ✅ UPLOAD BOTH IMAGES
      const uploads = [
        { file: frontFile, view: "front" },
        { file: backFile, view: "back" }
      ];

      for (const img of uploads) {
        console.log(`\n📸 Processing ${img.view} image...`);
        const imageId = uuidv4();

        // Try background removal, fallback to original if it fails
        let imageBuffer;
        try {
          if (process.env.REMOVEBGAPIKEY) {
            console.log(`🎨 Removing background for ${img.view}...`);
            imageBuffer = await removeBackground(img.file.buffer);
            console.log(`✅ Background removed for ${img.view}`);
          } else {
            console.log("⚠️ No REMOVEBGAPIKEY found, skipping background removal");
            imageBuffer = img.file.buffer;
          }
        } catch (bgError) {
          console.error(`⚠️ Background removal failed for ${img.view}:`, bgError.message);
          console.log("📸 Using original image instead");
          imageBuffer = img.file.buffer;
        }

        const s3Key = `raw/${req.userId}/wardrobe/${wardrobe_item_id}/${img.view}.jpg`;
        console.log(`📤 Uploading ${img.view} to S3: ${s3Key}`);

        await s3.upload({
          Bucket: process.env.S3BUCKETNAME,
          Key: s3Key,
          Body: imageBuffer,
          ContentType: img.file.mimetype,
        }).promise();

        console.log(`✅ ${img.view} uploaded to S3`);

        await pool.query(
            `
            INSERT INTO wardrobe_images
            (id, wardrobe_item_id, user_id, view, raw_path, status)
            VALUES ($1, $2, $3, $4, $5, $6)
            `,
            [imageId, wardrobe_item_id, req.userId, img.view, s3Key, "uploaded"]
            );

        console.log(`✅ ${img.view} saved to database`);
      }

      console.log("\n🎉 Both images uploaded successfully!");


      res.json({
        message: "✅ Front & Back images uploaded successfully"
      });

    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

app.get("/auth/me", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email FROM users WHERE id = $1",
      [req.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error("GET USER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


app.post("/auth/logout", verifyToken, async (req, res) => {
  try {
    // Optional: Log the logout event in database
    await pool.query(
      `INSERT INTO user_sessions (user_id, action, timestamp)
       VALUES ($1, $2, NOW())`,
      [req.userId, "logout"]
    );

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("LOGOUT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


app.get("/wardrobe/:wardrobe_item_id/images", verifyToken, async (req, res) => {
  try {
    const { wardrobe_item_id } = req.params;

    // 1️⃣ Fetch images from Postgres
    const result = await pool.query(
      `
      SELECT
        view,
        COALESCE(processed_path, raw_path) AS file_path
        FROM wardrobe_images
        WHERE wardrobe_item_id = $1 AND user_id = $2
      `,
      [wardrobe_item_id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "No images found for this wardrobe item",
      });
    }

    // 2️⃣ Generate signed URLs
    const images = {};

    for (const row of result.rows) {
      const signedUrl = s3.getSignedUrl("getObject", {
        Bucket: process.env.S3BUCKETNAME,
        Key: row.file_path,
        Expires: 60 * 10, // 10 minutes
      });

      images[row.view] = signedUrl;
    }

    // 3️⃣ Return response
    res.json({
      wardrobe_item_id,
      images,
    });

  } catch (err) {
    console.error("FETCH IMAGES ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


app.get("/wardrobe", verifyToken, async (req, res) => {
  try {
    const { category } = req.query; // Optional filter by category

    // Build query with optional category filter
    let query = `
      SELECT
        wi.id,
        wi.category,
        wi.created_at,
        json_agg(
          json_build_object(
            'view', wimg.view,
            'path', COALESCE(wimg.processed_path, wimg.raw_path)
          )
        ) FILTER (WHERE wimg.id IS NOT NULL) as images
      FROM wardrobe_items wi
      LEFT JOIN wardrobe_images wimg ON wi.id = wimg.wardrobe_item_id
      WHERE wi.user_id = $1
    `;

    const params = [req.userId];

    if (category) {
      query += ` AND wi.category = $2`;
      params.push(category);
    }

    query += `
      GROUP BY wi.id, wi.category, wi.created_at
      ORDER BY wi.created_at DESC
    `;

    const result = await pool.query(query, params);

    // Generate signed URLs for each image
    const itemsWithSignedUrls = result.rows.map(item => {
      const images = {};

      if (item.images && item.images.length > 0) {
        item.images.forEach(img => {
          if (img.path) {
            const signedUrl = s3.getSignedUrl("getObject", {
              Bucket: process.env.S3BUCKETNAME,
              Key: img.path,
              Expires: 60 * 10, // 10 minutes
            });
            images[img.view] = signedUrl;
          }
        });
      }

      return {
        id: item.id,
        category: item.category,
        created_at: item.created_at,
        images,
      };
    });

    res.json(itemsWithSignedUrls);
  } catch (err) {
    console.error("WARDROBE FETCH ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE wardrobe item and its images
app.delete("/wardrobe/:itemId", verifyToken, async (req, res) => {
  try {
    const { itemId } = req.params;

    console.log(`🗑️ Delete request for item: ${itemId}`);

    // 1️⃣ Verify ownership
    const owner = await pool.query(
      `SELECT 1 FROM wardrobe_items WHERE id = $1 AND user_id = $2`,
      [itemId, req.userId]
    );

    if (owner.rows.length === 0) {
      console.error("❌ Unauthorized delete attempt");
      return res.status(403).json({ error: "Unauthorized" });
    }

    // 2️⃣ Get all image paths from database
    const images = await pool.query(
      `SELECT COALESCE(processed_path, raw_path) as path
       FROM wardrobe_images
       WHERE wardrobe_item_id = $1`,
      [itemId]
    );

    console.log(`📸 Found ${images.rows.length} images to delete from S3`);

    // 3️⃣ Delete images from S3
    for (const img of images.rows) {
      if (img.path) {
        try {
          await s3.deleteObject({
            Bucket: process.env.S3BUCKETNAME,
            Key: img.path,
          }).promise();
          console.log(`✅ Deleted from S3: ${img.path}`);
        } catch (s3Error) {
          console.error(`⚠️ Failed to delete from S3: ${img.path}`, s3Error.message);
          // Continue even if S3 delete fails
        }
      }
    }

    // 4️⃣ Delete from database
    // First delete wardrobe_images (child records)
    await pool.query(
      `DELETE FROM wardrobe_images WHERE wardrobe_item_id = $1`,
      [itemId]
    );
    console.log(`✅ Deleted wardrobe_images from database`);

    // Then delete wardrobe_items (parent record)
    await pool.query(
      `DELETE FROM wardrobe_items WHERE id = $1`,
      [itemId]
    );
    console.log(`✅ Deleted wardrobe_item from database`);

    res.json({
      success: true,
      message: "Wardrobe item deleted successfully"
    });

  } catch (err) {
    console.error("DELETE WARDROBE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


app.post("/wardrobe/link", verifyToken, async (req, res) => {
  try { // ✅ ADD THIS
    const { wardrobe_item_id, product_url } = req.body;

    if (!wardrobe_item_id || !product_url) {
      return res.status(400).json({
        error: "wardrobe_item_id and product_url are required"
      });
    }
    
    // Verify ownership
    const owner = await pool.query(
      `SELECT 1 FROM wardrobe_items WHERE id = $1 AND user_id = $2`,
      [wardrobe_item_id, req.userId]
    );
    if (owner.rows.length === 0) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // 🔴 Check duplicate
    const existing = await pool.query(
      `SELECT 1 FROM wardrobe_images WHERE wardrobe_item_id = $1`,
      [wardrobe_item_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        error: "Images already exist for this wardrobe item"
      });
    }

    // 1️⃣ Scrape images
    const imageUrls = await scrapeProductImages(product_url);

    if (imageUrls.length < 2) {
      return res.status(400).json({
        error: "Could not extract enough images from product page"
      });
    }

    const views = ["front", "back"];

    for (let i = 0; i < 2; i++) {
      const imageBuffer = await axios.get(imageUrls[i], {
        responseType: "arraybuffer"
      });

      // 2️⃣ Remove background
      const bgRemovedBuffer = await removeBackground(
        Buffer.from(imageBuffer.data)
      );

      // 3️⃣ Upload to S3
      const s3Key = `raw/${req.userId}/wardrobe/${wardrobe_item_id}/${views[i]}.png`; // ✅ ADD user_id to path

      await s3.upload({
        Bucket: process.env.S3BUCKETNAME,
        Key: s3Key,
        Body: bgRemovedBuffer,
        ContentType: "image/png"
      }).promise();

      // 4️⃣ Insert DB
      await pool.query(
        `
        INSERT INTO wardrobe_images
        (id, wardrobe_item_id, user_id, view, raw_path, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          uuidv4(),
          wardrobe_item_id,
          req.userId, // ✅ ADD user_id
          views[i],
          s3Key,
          "uploaded"
        ]
      );
    }

    res.json({
      message: "✅ Product images imported successfully"
    });

  } catch (err) {
    console.error("LINK UPLOAD ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


// For Testing
app.post("/auth/dev", async (req, res) => {
  if (process.env.NODEENV !== "development") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const userId = uuidv4();

  await pool.query(
    `
    INSERT INTO users (id, apple_user_id, email)
    VALUES ($1, $2, $3)
    `,
    [userId, `dev-${userId}`, "dev@test.com"]
  );

  const token = createToken(userId);

  res.json({ token });
});

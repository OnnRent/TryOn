const express = require("express");
const app = express();
const { v4: uuidv4 } = require("uuid");
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

app.listen(3000, () => {
  console.log("Server running on https://try-on-ochre.vercel.app/");
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
      const { wardrobe_item_id } = req.body;

      if (!wardrobe_item_id) {
        return res.status(400).json({ error: "wardrobe_item_id is required" });
      }

      const frontFile = req.files?.front?.[0];
      const backFile = req.files?.back?.[0];

      if (!frontFile || !backFile) {
        return res.status(400).json({
          error: "Both front and back images are required",
        });
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
        return res.status(400).json({
          error: "Images already uploaded for this item",
        });
      }

      // ✅ UPLOAD BOTH IMAGES
      const uploads = [
        { file: frontFile, view: "front" },
        { file: backFile, view: "back" }
      ];

      for (const img of uploads) {
        const imageId = uuidv4();

        const bgRemovedBuffer = await removeBackground(img.file.buffer);


        const s3Key = `raw/${req.userId}/wardrobe/${wardrobe_item_id}/${img.view}.jpg`;

        await s3.upload({
          Bucket: process.env.S3BUCKETNAME,
          Key: s3Key,
        //   Body: img.file.buffer,
          Body:bgRemovedBuffer,
          ContentType: img.file.mimetype,
        }).promise();

        await pool.query(
            `
            INSERT INTO wardrobe_images
            (id, wardrobe_item_id, user_id, view, raw_path, status)
            VALUES ($1, $2, $3, $4, $5, $6)
            `,
            [imageId, wardrobe_item_id, req.userId, img.view, s3Key, "uploaded"]
            );
      }

      const owner = await pool.query(
        `
        SELECT 1 FROM wardrobe_items
        WHERE id = $1 AND user_id = $2
        `,
        [wardrobe_item_id, req.userId]
        );

        if (owner.rows.length === 0) {
        return res.status(403).json({ error: "Unauthorized" });
        }


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
  const result = await pool.query(
    `
    SELECT id, category
    FROM wardrobe_items
    WHERE user_id = $1
    `,
    [req.userId]
  );
  res.json(result.rows);
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
  if (process.env.NODE_ENV !== "development") {
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
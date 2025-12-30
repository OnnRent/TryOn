// removeBackground.js
const axios = require("axios");
const FormData = require("form-data");
const sharp = require("sharp");

async function removeBackground(buffer) {
  // Convert any image format to JPG using sharp
  // This ensures compatibility with Remove.bg API
  console.log("🔄 Converting image to JPG format...");
  const jpgBuffer = await sharp(buffer)
    .jpeg({ quality: 90 }) 
    .toBuffer();

  console.log(`✅ Converted to JPG (${jpgBuffer.length} bytes)`);

  const formData = new FormData();
  formData.append("image_file", jpgBuffer, {
    filename: "image.jpg",
    contentType: "image/jpeg",
  });
  formData.append("size", "auto");

  console.log("📤 Sending to Remove.bg API...");
  const response = await axios.post(
    "https://api.remove.bg/v1.0/removebg",
    formData,
    {
      headers: {
        ...formData.getHeaders(),
        "X-Api-Key": process.env.REMOVEBGAPIKEY,
      },
      responseType: "arraybuffer",
    }
  );

  console.log("✅ Background removed successfully");
  return Buffer.from(response.data);
}

module.exports = removeBackground;

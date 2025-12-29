// removeBackground.js
const axios = require("axios");
const FormData = require("form-data");

async function removeBackground(buffer) {
  const formData = new FormData();
  formData.append("image_file", buffer, {
    filename: "image.jpg",
  });
  formData.append("size", "auto");

  const response = await axios.post(
    "https://api.remove.bg/v1.0/removebg",
    formData,
    {
      headers: {
        ...formData.getHeaders(),
        "X-Api-Key": process.env.REMOVE_BG_API_KEY,
      },
      responseType: "arraybuffer",
    }
  );

  return Buffer.from(response.data);
}

module.exports = removeBackground;


const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.json({ status: "OK", message: "TryOn API is running" });
});
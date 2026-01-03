const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const ImageSchema = new mongoose.Schema({
  url: String,
  expiresAt: Date,
});
const Image = mongoose.model("Image", ImageSchema);

const storage = multer.diskStorage({});
const upload = multer({ storage });

app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);

    let expiresAt = null;
    if (req.body.duration !== "permanent") {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + Number(req.body.duration));
    }

    await Image.create({
      url: result.secure_url,
      expiresAt,
    });

    res.json({ message: "✅ Image uploaded successfully!" });
  } catch (err) {
    res.status(500).json({ message: "❌ Upload failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));

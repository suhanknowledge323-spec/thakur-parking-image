const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

const ImageSchema = new mongoose.Schema({
  url: String,
  publicId: String,
  expireAt: Date
});

const Image = mongoose.model("Image", ImageSchema);

const upload = multer({ dest: "uploads/" });

function getExpireDate(value) {
  if (value === "permanent") return null;
  const d = new Date();
  d.setDate(d.getDate() + parseInt(value));
  return d;
}

app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    const expireAt = getExpireDate(req.body.expiry);

    const img = await Image.create({
      url: result.secure_url,
      publicId: result.public_id,
      expireAt
    });

    res.json({ link: `/img/${img._id}` });
  } catch (e) {
    res.status(500).json({ error: "Upload failed" });
  }
});

app.get("/img/:id", async (req, res) => {
  const img = await Image.findById(req.params.id);
  if (!img) return res.send("Image expired or deleted");
  res.redirect(img.url);
});

app.listen(process.env.PORT || 3000, () =>
  console.log("Server running")
);

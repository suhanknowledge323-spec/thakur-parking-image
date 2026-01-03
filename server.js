const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cron = require('node-cron');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

// CONFIGURATION - MongoDB & Cloudinary
const MONGO_URI = "mongodb+srv://thakurimage:<db_password>@freecluster.fqx4f5k.mongodb.net/?appName=FreeCluster";

cloudinary.config({
    cloud_name: 'dhx94fuj5',
    api_key: '715774688486276',
    api_secret: 'bFeJYZz_...your_full_secret_here...' 
});

// DATABASE CONNECT
mongoose.connect(MONGO_URI)
    .then(() => console.log("MongoDB Connected Successfully"))
    .catch(err => console.error("MongoDB Connection Error:", err));

// DB SCHEMA
const ImageSchema = new mongoose.Schema({
    cloudinaryId: String,
    url: String,
    expiryDate: Date, 
    createdAt: { type: Date, default: Date.now }
});
const Image = mongoose.model('Image', ImageSchema);

// STORAGE CONFIG
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'THAKUR_PARKING',
        allowed_formats: ['jpg', 'png', 'jpeg', 'gif']
    }
});
const upload = multer({ storage: storage });

// API: UPLOAD IMAGE
app.post('/api/upload', upload.single('image'), async (req, res) => {
    try {
        const { retention } = req.body;
        let expiryDate = null;

        if (retention !== 'permanent') {
            const days = parseInt(retention);
            expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + days);
        }

        const newImage = new Image({
            cloudinaryId: req.file.filename,
            url: req.file.path,
            expiryDate: expiryDate
        });

        await newImage.save();
        res.json({ success: true, url: req.file.path });
    } catch (error) {
        res.status(500).json({ success: false, message: "Upload failed" });
    }
});

// CRON JOB: DELETE EXPIRED IMAGES (Every Hour)
cron.schedule('0 * * * *', async () => {
    console.log("Checking for expired images...");
    const expired = await Image.find({ expiryDate: { $ne: null, $lte: new Date() } });
    
    for (const img of expired) {
        await cloudinary.uploader.destroy(img.cloudinaryId);
        await Image.findByIdAndDelete(img._id);
        console.log(`Deleted: ${img.cloudinaryId}`);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server live on port ${PORT}`));

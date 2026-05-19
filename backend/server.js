const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Permanent Cloud Mongo Cluster URI Connection
const MONGO_URI = "mongodb+srv://fireclone:ZahraIsmael20!@fireclone.d0a3uou.mongodb.net/?appName=Fireclone";

mongoose.connect(MONGO_URI)
    .then(() => console.log("Database persistent connection established!"))
    .catch(err => console.error("Database initialization crash error:", err));

app.use(cors());
app.use(express.json());

// Verify local physical staging disk directory exists on host
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer Storage Management Setup Configuration
const storageConfig = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storageConfig });

// Stream files publicly down to the frontend layout via direct absolute URL tracking
app.use('/uploads', express.static(uploadDir));

// --- REAL-TIME CLOUD SCHEMAS ---
let serverStats = { totalRequests: 0, startTime: Date.now(), status: "Healthy" };

const DataRow = mongoose.model('DataRow', new mongoose.Schema({
    collectionName: String,
    username: String,
    is_premium: Boolean
}, { timestamps: true }));

const StorageFile = mongoose.model('StorageFile', new mongoose.Schema({
    name: String,
    type: String,
    size: String,
    url: String
}, { timestamps: true }));

// GLOBAL MONITOR TRAFFIC MIDDLEWARE
app.use((req, res, next) => {
    serverStats.totalRequests++;
    next();
});

app.get('/api/v1/analytics', async (req, res) => {
    const uptimeMinutes = Math.floor((Date.now() - serverStats.startTime) / 60000);
    const dbCount = await DataRow.countDocuments();
    res.json({
        totalRequests: serverStats.totalRequests,
        uptime: `${uptimeMinutes}m`,
        status: serverStats.status,
        databaseSize: `${dbCount} records stored permanently`
    });
});

// --- PERSISTENT DATA DRIVEN COLLECTIONS API ---
app.get('/api/v1/database/:collection', async (req, res) => {
    try {
        const records = await DataRow.find({ collectionName: req.params.collection });
        res.json(records.map(rec => ({
            id: rec._id,
            username: rec.username,
            is_premium: rec.is_premium
        })));
    } catch (error) {
        res.status(500).json({ error: "Cloud database fetch drop." });
    }
});

app.post('/api/v1/database/:collection', async (req, res) => {
    try {
        const newRecord = new DataRow({
            collectionName: req.params.collection,
            username: req.body.username,
            is_premium: req.body.is_premium
        });
        await newRecord.save();
        res.status(201).json({ message: "Saved to cloud storage cluster!", id: newRecord._id });
    } catch (error) {
        res.status(500).json({ error: "Failed to save document record." });
    }
});

// --- REAL BINARY FILE STORAGE API ---
app.get('/api/v1/storage', async (req, res) => {
    try {
        const files = await StorageFile.find();
        res.json(files.map(f => ({
            id: f._id, name: f.name, type: f.type, size: f.size, url: f.url
        })));
    } catch (error) {
        res.status(500).json({ error: "Bucket mapping query error." });
    }
});

app.post('/api/v1/storage/upload', upload.single('fileAsset'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No physical file received by engine backend." });
        }

        const sizeInMb = (req.file.size / (1024 * 1024)).toFixed(2);
        const displaySize = sizeInMb > 1.0 ? `${sizeInMb} MB` : `${(req.file.size / 1024).toFixed(1)} KB`;

        const hostUrl = req.protocol + '://' + req.get('host');
        const fileDownloadUrl = `${hostUrl}/uploads/${req.file.filename}`;

        const fileRecord = new StorageFile({
            name: req.file.originalname,
            type: req.file.mimetype,
            size: displaySize,
            url: fileDownloadUrl
        });

        await fileRecord.save();
        res.status(201).json(fileRecord);
    } catch (error) {
        res.status(500).json({ error: "File upload processing system failure." });
    }
});

app.delete('/api/v1/storage/:id', async (req, res) => {
    try {
        const fileData = await StorageFile.findById(req.params.id);
        if (fileData && fileData.url) {
            const filename = fileData.url.split('/uploads/')[1];
            const physicalPath = path.join(uploadDir, filename);
            if (fs.existsSync(physicalPath)) {
                fs.unlinkSync(physicalPath);
            }
        }
        await StorageFile.findByIdAndDelete(req.params.id);
        res.json({ message: "File metadata and binary contents deleted." });
    } catch (error) {
        res.status(500).json({ error: "Deletion failure event logged." });
    }
});

app.listen(PORT, () => {
    console.log(`Storage Enhanced Backend engine running on port ${PORT}`);
});
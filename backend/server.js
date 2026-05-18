const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 5000;

// 🚨 PASTE YOUR MONGODB ATLAS CONNECTION STRING HERE
const MONGO_URI = "mongodb+srv://fireclone:ZahraIsmael20!@fireclone.d0a3uou.mongodb.net/?appName=Fireclone";

// Connect directly to the Cloud MongoDB Cluster
mongoose.connect(MONGO_URI)
    .then(() => console.log("Database persistent connection established!"))
    .catch(err => console.error("Database initialization crash error:", err));

app.use(cors());
app.use(express.json());

// --- TELEMETRY AND DATABASE SCHEMAS ---
let serverStats = { totalRequests: 0, startTime: Date.now(), status: "Healthy" };

// Blueprint definition for row variables saved inside collections
const DataRowSchema = new mongoose.Schema({
    collectionName: String,
    username: String,
    is_premium: Boolean
}, { timestamps: true });

const DataRow = mongoose.model('DataRow', DataRowSchema);

// Storage tracking Schema
const StorageFileSchema = new mongoose.Schema({
    name: String,
    type: String,
    size: String,
    url: String
});

const StorageFile = mongoose.model('StorageFile', StorageFileSchema);

// GLOBAL TRAFFIC TRACKING MIDDLEWARE
app.use((req, res, next) => {
    serverStats.totalRequests++;
    next();
});

app.get('/api/v1/analytics', async (req, res) => {
    const uptimeMinutes = Math.floor((Date.now() - serverStats.startTime) / 60000);
    // Dynamic analytics: count how many rows exist total inside the cluster database
    const dbCount = await DataRow.countDocuments();
    res.json({
        totalRequests: serverStats.totalRequests,
        uptime: `${uptimeMinutes}m`,
        status: serverStats.status,
        databaseSize: `${dbCount} records stored permanently`
    });
});

// --- PERSISTENT DATABASE IMPLEMENTATION ---
app.get('/api/v1/database/:collection', async (req, res) => {
    try {
        const records = await DataRow.find({ collectionName: req.params.collection });
        // Format layout to match previous UUID output structures for frontend UI mapping consistency
        const formattedData = records.map(rec => ({
            id: rec._id,
            username: rec.username,
            is_premium: rec.is_premium
        }));
        res.json(formattedData);
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
        res.status(500).json({ error: "Failed to save document record onto cloud database." });
    }
});

// --- PERSISTENT STORAGE TRACKING IMPLEMENTATION ---
app.get('/api/v1/storage', async (req, res) => {
    try {
        const files = await StorageFile.find();
        const formattedFiles = files.map(f => ({
            id: f._id, name: f.name, type: f.type, size: f.size, url: f.url
        }));
        res.json(formattedFiles);
    } catch (error) {
        res.status(500).json({ error: "Bucket mapping query error." });
    }
});

app.post('/api/v1/storage', async (req, res) => {
    try {
        const file = new StorageFile({
            name: req.body.name,
            type: req.body.type,
            size: req.body.size,
            url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500"
        });
        await file.save();
        res.status(201).json(file);
    } catch (error) {
        res.status(500).json({ error: "File write execution drop." });
    }
});

app.delete('/api/v1/storage/:id', async (req, res) => {
    try {
        await StorageFile.findByIdAndDelete(req.params.id);
        res.json({ message: "File metadata deleted from cluster safely." });
    } catch (error) {
        res.status(500).json({ error: "Deletion failure event logged." });
    }
});

app.listen(PORT, () => {
    console.log(`Persistent Backend engine running on port ${PORT}`);
});

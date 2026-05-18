const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let serverStats = {
    totalRequests: 0,
    startTime: Date.now(),
    status: "Healthy"
};

let mockCollections = {
    users_profile: [
        { id: "8f3b-410a-991c", username: "alex_dev", is_premium: true },
        { id: "2c9a-47ef-812b", username: "sarah_k", is_premium: false }
    ],
    posts: []
};

// Real Storage Array to hold tracking data for uploaded files
let mockStorageFiles = [
    { id: "st-991a", name: "user_avatar_default.png", type: "image/png", size: "45 KB", url: "#" },
    { id: "st-442b", name: "app_background.jpg", type: "image/jpeg", size: "1.2 MB", url: "#" }
];

// MIDDLEWARE: Count traffic
app.use((req, res, next) => {
    serverStats.totalRequests++;
    next();
});

app.get('/api/v1/analytics', (req, res) => {
    const uptimeMinutes = Math.floor((Date.now() - serverStats.startTime) / 60000);
    res.json({
        totalRequests: serverStats.totalRequests,
        uptime: `${uptimeMinutes}m`,
        status: serverStats.status,
        databaseSize: `${JSON.stringify(mockCollections).length} bytes`
    });
});

// --- DATABASE ROUTES ---
app.get('/api/v1/database/:collection', (req, res) => {
    const collectionName = req.params.collection;
    if (mockCollections[collectionName]) {
        res.json(mockCollections[collectionName]);
    } else {
        res.status(404).json({ error: "Collection not found" });
    }
});

app.post('/api/v1/database/:collection', (req, res) => {
    const collectionName = req.params.collection;
    const newData = req.body;
    if (!mockCollections[collectionName]) mockCollections[collectionName] = [];
    
    const newId = Math.random().toString(36).substring(2, 11);
    const savedRecord = { id: newId, ...newData };
    mockCollections[collectionName].push(savedRecord);
    res.status(201).json({ message: "Data saved successfully!", data: savedRecord });
});

// --- NEW SERVICE: STORAGE ROUTES ---
// Route 1: Get all files inside the storage bucket
app.get('/api/v1/storage', (req, res) => {
    res.json(mockStorageFiles);
});

// Route 2: Add a file record to the storage bucket
app.post('/api/v1/storage', (req, res) => {
    const { name, type, size } = req.body;
    const newFile = {
        id: `st-${Math.random().toString(36).substring(2, 7)}`,
        name: name || "untitled_file.dat",
        type: type || "application/octet-stream",
        size: size || "0 KB",
        url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500" // placeholder asset link
    };
    mockStorageFiles.push(newFile);
    res.status(201).json(newFile);
});

// Route 3: Delete a file from the storage bucket
app.delete('/api/v1/storage/:id', (req, res) => {
    const fileId = req.params.id;
    mockStorageFiles = mockStorageFiles.filter(file => file.id !== fileId);
    res.json({ message: "File deleted successfully from storage cluster." });
});

app.listen(PORT, () => {
    console.log(`Backend engine running on port ${PORT}`);
});

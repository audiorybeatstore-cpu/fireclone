const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Track server statistics
let serverStats = {
    totalRequests: 0,
    startTime: Date.now(),
    status: "Healthy"
};

// Mock database storage
let mockCollections = {
    users_profile: [
        { id: "8f3b-410a-991c", username: "alex_dev", is_premium: true },
        { id: "2c9a-47ef-812b", username: "sarah_k", is_premium: false }
    ],
    posts: []
};

// MIDDLEWARE: Count every single request hitting this backend
app.use((req, res, next) => {
    serverStats.totalRequests++;
    next();
});

// Route 1: Get backend system and analytics stats
app.get('/api/v1/analytics', (req, res) => {
    // Calculate server uptime in minutes
    const uptimeMinutes = Math.floor((Date.now() - serverStats.startTime) / 60000);
    
    res.json({
        totalRequests: serverStats.totalRequests,
        uptime: `${uptimeMinutes}m`,
        status: serverStats.status,
        databaseSize: `${JSON.stringify(mockCollections).length} bytes`
    });
});

// Route 2: Get all data for a specific database collection
app.get('/api/v1/database/:collection', (req, res) => {
    const collectionName = req.params.collection;
    if (mockCollections[collectionName]) {
        res.json(mockCollections[collectionName]);
    } else {
        res.status(404).json({ error: "Collection not found" });
    }
});

// Route 3: Add a new row/record to a collection
app.post('/api/v1/database/:collection', (req, res) => {
    const collectionName = req.params.collection;
    const newData = req.body;
    
    if (!mockCollections[collectionName]) {
        mockCollections[collectionName] = [];
    }
    
    const newId = Math.random().toString(36).substring(2, 11);
    const savedRecord = { id: newId, ...newData };
    
    mockCollections[collectionName].push(savedRecord);
    res.status(201).json({ message: "Data saved successfully!", data: savedRecord });
});

app.listen(PORT, () => {
    console.log(`Backend engine running on port ${PORT}`);
});

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS so our frontend dashboard can talk to this backend
app.use(cors());
app.use(express.json());

// Mock database in memory (Temporary, we will connect a real database later!)
let mockCollections = {
    users_profile: [
        { id: "8f3b-410a-991c", username: "alex_dev", is_premium: true },
        { id: "2c9a-47ef-812b", username: "sarah_k", is_premium: false }
    ],
    posts: []
};

// Route 1: Test route to see if backend is alive
app.get('/', (req, res) => {
    res.json({ status: "FireClone Backend Engine is running smoothly!" });
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

// Route 3: Add a new row/record to a collection (Like Firestore's addDoc)
app.post('/api/v1/database/:collection', (req, res) => {
    const collectionName = req.params.collection;
    const newData = req.body;
    
    if (!mockCollections[collectionName]) {
        mockCollections[collectionName] = [];
    }
    
    // Generate a quick fake ID
    const newId = Math.random().toString(36).substring(2, 11);
    const savedRecord = { id: newId, ...newData };
    
    mockCollections[collectionName].push(savedRecord);
    res.status(201).json({ message: "Data saved successfully!", data: savedRecord });
});

app.listen(PORT, () => {
    console.log(`Backend engine running on port ${PORT}`);
});

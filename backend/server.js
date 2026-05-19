const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// Security JWT Token Secret Key Phrase
const JWT_SECRET = "fireclone_super_crypto_secret_key_99x!";

// Permanent Cloud Mongo Cluster URI Connection
const MONGO_URI = "mongodb+srv://fireclone:ZahraIsmael20!@fireclone.d0a3uou.mongodb.net/?appName=Fireclone";

mongoose.connect(MONGO_URI)
    .then(() => console.log("Database persistent connection established!"))
    .catch(err => console.error("Database initialization crash error:", err));

app.use(cors());
app.use(express.json());

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storageConfig = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, uploadDir); },
    filename: (req, file, cb) => { cb(null, Date.now() + '-' + file.originalname); }
});
const upload = multer({ storage: storageConfig });

app.use('/uploads', express.static(uploadDir));

// --- REAL-TIME DATA SCHEMAS ---
let serverStats = { totalRequests: 0, startTime: Date.now(), status: "Healthy" };

// User Authentication Account Schema
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

const DataRow = mongoose.model('DataRow', new mongoose.Schema({
    collectionName: String, username: String, is_premium: Boolean
}, { timestamps: true }));

const StorageFile = mongoose.model('StorageFile', new mongoose.Schema({
    name: String, type: String, size: String, url: String
}, { timestamps: true }));

// GLOBAL TRAFFIC TRACKING
app.use((req, res, next) => {
    serverStats.totalRequests++;
    next();
});

// AUTHENTICATION MIDDLEWARE SHIELD (Secures private endpoints)
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Access Denied. Token payload missing." });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Invalid token validation signature." });
        }
        req.user = user;
        next();
    });
};

// --- AUTHENTICATION REGISTRATION & LOGIN ENDPOINTS ---
app.post('/api/v1/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: "Missing parameters." });

        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ error: "User profile identifier already taken." });

        // Hash password cleanly before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "Admin account registered safely!" });
    } catch (error) {
        res.status(500).json({ error: "Registration execution dropped." });
    }
});

app.post('/api/v1/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ error: "Invalid account username credential." });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: "Security decryption password mismatch." });

        // Grant access token that expires in 12 hours
        const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '12h' });
        res.json({ token, message: "Authentication validation successful." });
    } catch (error) {
        res.status(500).json({ error: "Authorization login stream crash." });
    }
});

// Analytics can remain public for dashboard check-ins
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

// --- SECURED DATABASE ROUTES (Added authenticateToken) ---
app.get('/api/v1/database/:collection', authenticateToken, async (req, res) => {
    try {
        const records = await DataRow.find({ collectionName: req.params.collection });
        res.json(records.map(rec => ({ id: rec._id, username: rec.username, is_premium: rec.is_premium })));
    } catch (error) {
        res.status(500).json({ error: "Cloud database fetch drop." });
    }
});

app.post('/api/v1/database/:collection', authenticateToken, async (req, res) => {
    try {
        const newRecord = new DataRow({
            collectionName: req.params.collection, username: req.body.username, is_premium: req.body.is_premium
        });
        await newRecord.save();
        res.status(201).json({ message: "Saved to cloud storage cluster!", id: newRecord._id });
    } catch (error) {
        res.status(500).json({ error: "Failed to save document record." });
    }
});

// --- SECURED STORAGE ROUTES (Added authenticateToken) ---
app.get('/api/v1/storage', authenticateToken, async (req, res) => {
    try {
        const files = await StorageFile.find();
        res.json(files.map(f => ({ id: f._id, name: f.name, type: f.type, size: f.size, url: f.url })));
    } catch (error) {
        res.status(500).json({ error: "Bucket mapping query error." });
    }
});

app.post('/api/v1/storage/upload', authenticateToken, upload.single('fileAsset'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No physical file received." });
        const sizeInMb = (req.file.size / (1024 * 1024)).toFixed(2);
        const displaySize = sizeInMb > 1.0 ? `${sizeInMb} MB` : `${(req.file.size / 1024).toFixed(1)} KB`;
        const hostUrl = req.protocol + '://' + req.get('host');
        const fileRecord = new StorageFile({
            name: req.file.originalname, type: req.file.mimetype, size: displaySize, url: `${hostUrl}/uploads/${req.file.filename}`
        });
        await fileRecord.save();
        res.status(201).json(fileRecord);
    } catch (error) {
        res.status(500).json({ error: "File upload processing failure." });
    }
});

app.delete('/api/v1/storage/:id', authenticateToken, async (req, res) => {
    try {
        const fileData = await StorageFile.findById(req.params.id);
        if (fileData && fileData.url) {
            const filename = fileData.url.split('/uploads/')[1];
            const physicalPath = path.join(uploadDir, filename);
            if (fs.existsSync(physicalPath)) fs.unlinkSync(physicalPath);
        }
        await StorageFile.findByIdAndDelete(req.params.id);
        res.json({ message: "File deleted cleanly." });
    } catch (error) {
        res.status(500).json({ error: "Deletion failure." });
    }
});

app.listen(PORT, () => {
    console.log(`Auth Protected Backend engine running on port ${PORT}`);
});
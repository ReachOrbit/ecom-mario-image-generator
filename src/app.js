require('dotenv').config();
const express = require('express');
const logger = require('./utils/logger');
const multer = require('multer');
const processController = require('./controllers/processController');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes will be added here
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// Configure multer for file upload
const upload = multer({
    dest: 'uploads/',
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Serve static files from public directory
app.use(express.static('public'));

// API Routes
app.post('/api/process', 
    upload.single('file'), // Handle file upload
    processController.processProfiles
);

app.post('/api/generate-placeholder-images',
    upload.single('file'), // Handle file upload
    processController.processProfilesWithCharacterImagesAlreadyIncluded
);

app.post('/api/remove-background-from-character-images',
    upload.single('file'), // Handle file upload
    processController.processProfilesAndRemoveBackgroundFromCharacterImages
);


// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Error:', err);
    res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});

// Increase the server timeout to 10 minutes (600000 milliseconds)
server.setTimeout(600000);

module.exports = app; 
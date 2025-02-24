const fs = require('fs');
const path = require('path');

function findImageIndex() {
    const directoryPath = path.join(__dirname, '../../processed_images');
    
    // Read the directory
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return console.error('Unable to scan directory: ' + err);
        } 
        
        // Find the index of the file
        const index = files.indexOf('Victoria_Mancino.png');
        
        if (index !== -1) {
            console.log(`Index of Victoria_Mancino.png: ${index}`);
        } else {
            console.log('Victoria_Mancino.png not found in the directory.');
        }
    });
}

findImageIndex();
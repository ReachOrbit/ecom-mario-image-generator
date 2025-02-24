const testConfig = require('./testConfig');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const imagineApiService = require('../services/imagineApiService');
const logger = require('../utils/logger');

async function testDiscordIntegration() {
    try {
        logger.info('Starting Discord integration test');
        
        // Validate Discord token first
        await testConfig.validateDiscordToken();
        logger.info('Discord token validated');

        // // Create test directory if it doesn't exist
        // const testDir = path.join(__dirname, 'test-assets');
        // await fs.mkdir(testDir, { recursive: true });
        // logger.info('Test directory created/verified');

        // Process each image in the processed_images folder
        const processedImagesDir = path.join(__dirname, '../../test_images_2');
        const files = await fs.readdir(processedImagesDir);

        console.log(files);
        
        // Till  (79, 200)
        for (const file of files) {
            logger.info(`Processing image: ${file}`);

            // Test pixel art generation
            const result = await imagineApiService.generatePixelArt(
                file,
                file
            );

            logger.info('Generated pixel art URL:', result);
        }

        logger.info('All images processed successfully');
    } catch (error) {
        logger.error('Test failed:', error);
        throw error;
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    testDiscordIntegration()
        .then(result => {
            console.log('Test completed successfully');
            console.log('Result:', result);
            process.exit(0);
        })
        .catch(error => {
            console.error('Test failed:', error.message);
            process.exit(1);
        });
}

module.exports = testDiscordIntegration; 
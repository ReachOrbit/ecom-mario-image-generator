const sharp = require('sharp');
const axios = require('axios');
const path = require('path');
const fs = require('fs').promises;
const logger = require('../utils/logger');
const imagineApiService = require('./imagineApiService');
const { fileFromPath } = require('formdata-node/file-from-path');
/**
 * Service for processing profile images and generating pixel art
 * Flow:
 * 1. Downloads profile picture from LinkedIn URL
 * 2. Processes original image (resizing, optimization)
 * 3. Sends image to Discord for pixel art generation
 * 4. Downloads resulting pixel art
 * 5. Saves both original and pixel art versions
 */
class ImageProcessingService {
    constructor() {
        this.outputDir = path.join(process.cwd(), 'processed_images');
        this.ensureOutputDirectory();

        // Configure Sharp defaults
        sharp.cache(false); // Disable caching for memory efficiency
        sharp.concurrency(1); // Limit concurrent processing
    }

    async ensureOutputDirectory() {
        try {
            await fs.mkdir(this.outputDir, { recursive: true });
        } catch (error) {
            logger.error('Error creating output directory:', error);
            throw new Error('Failed to create output directory');
        }
    }

    async downloadImage(url) {
        try {
            logger.info(`Downloading image from: ${url}`);
            const response = await axios({
                url,
                responseType: 'arraybuffer',
                timeout: 10000 // 10 second timeout
            });
            return Buffer.from(response.data, 'binary');
        } catch (error) {
            logger.error('Error downloading image:', error);
            throw new Error(`Failed to download image: ${error.message}`);
        }
    }

    async processProfilePicture(imageUrl, filename, hubspotId) {
        console.log('processProfilePicture', imageUrl, filename, hubspotId);
        let tempFilePath = null;
        try {
            logger.info(`Processing profile picture for: ${filename}`);

            // const imageBuffer = await this.downloadImage(imageUrl);

            // // Validate image before processing
            // await sharp(imageBuffer).metadata();

            // // Process original image
            // const outputPath = path.join(this.outputDir, `${filename}.png`);
            // await sharp(imageBuffer)
            //     .resize(800, 800, {
            //         fit: 'contain',
            //         background: { r: 255, g: 255, b: 255, alpha: 1 }
            //     })
            //     .png({
            //         quality: 90,
            //         compressionLevel: 9,
            //         palette: true
            //     })
            //     .toFile(outputPath);

            // // Generate pixel art version
            const pixelArtUrls = await imagineApiService.generatePixelArt(imageUrl, filename, hubspotId);

            return {
                // originalPath: outputPath,
                pixelArtUrls: pixelArtUrls
            };

        } catch (error) {
            logger.error('Error processing profile picture:', error);
            if (tempFilePath) {
                try {
                    await fs.unlink(tempFilePath);
                } catch (cleanupError) {
                    logger.error('Error cleaning up temporary file:', cleanupError);
                }
            }
            throw new Error(`Failed to process profile picture: ${error.message}`);
        }
    }

    async processProfilePictureWithCharacterImageAlreadyIncluded(imageUrl, filename, hubspotId) {
        console.log('processProfilePictureWithCharacterImageAlreadyIncluded', imageUrl, filename, hubspotId);
        let tempFilePath = null;
        try {
            logger.info(`Processing character image for: ${filename}`);

            // // Generate pixel art version
            const placeholderArtUrls = await imagineApiService.generatePlaceholderArt(imageUrl, filename, hubspotId);

            return {
                // originalPath: outputPath,
                placeholderArtUrls: placeholderArtUrls
            };

        } catch (error) {
            logger.error('Error processing profile picture:', error);
            if (tempFilePath) {
                try {
                    await fs.unlink(tempFilePath);
                } catch (cleanupError) {
                    logger.error('Error cleaning up temporary file:', cleanupError);
                }
            }
            throw new Error(`Failed to process profile picture: ${error.message}`);
        }
    }

    async removeBackgroundFromCharacterImage(imageUrl, filename, hubspotId) {
        console.log('removeBackgroundFromCharacterImage', imageUrl, filename, hubspotId);
        const imageFilePath = path.join(process.cwd(), `downloads/${filename}-original.png`);
        const apiKey = process.env.PHOTO_ROOM_API_KEY; // Replace with your actual API key

        try {
            // Check if background image already exists in digital ocean spaces
            const imageExists = await imagineApiService.checkIfBackgroundImageExistsOnDigitalOceanSpaces(hubspotId);
            if (imageExists) {
                console.log('Background image exists in digital ocean spaces', imageExists);
                return imageExists;
            }

            if (imageUrl.includes('drive.google.com')) {
                // Check digital ocean spaces for the image
                console.log('Checking if background image exists in digital ocean spaces', hubspotId);
                const imageExists = await imagineApiService.checkIfDriveImageExistsOnDigitalOceanSpaces(hubspotId);
                console.log('Background image exists in digital ocean spaces', imageExists);
                if (imageExists) {
                    console.log('Background image exists in digital ocean spaces', imageExists);
                    imageUrl = imageExists;
                }
                else {
                    imageUrl = await imagineApiService.convertToDirectDownloadLink(imageUrl);
                    // Download the image using axios
                    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
                    const buffer = response.data; // This is the image buffer

                    // Upload the image to DigitalOcean Spaces
                    const uploadedUrl = await imagineApiService.uploadBufferToDigitalOceanSpaces(buffer, hubspotId, "gdrive_character_image");

                    // Return the uploaded image URL
                    imageUrl = uploadedUrl;
                }
            }
            // Ensure the directory exists
            const directoryPath = path.dirname(imageFilePath);
            await fs.mkdir(directoryPath, { recursive: true });
            // Download the image
            await this.downloadImageFromUrl(imageUrl, imageFilePath);
            // Remove the background
            console.log('***Removing background from image:', hubspotId);
            const buffer = await this.removeBackgroundWithPhotoRoom(imageFilePath, apiKey);

            const generatedImageUrl = await imagineApiService.uploadBufferToDigitalOceanSpaces(buffer, hubspotId, "character_image_no_bg")

            return generatedImageUrl;
        } catch (error) {
            logger.error('Error removing background from image:', error);
            throw new Error(`Failed to remove background: ${error.message}`);
        }
    }

    async downloadImageFromUrl(url, path) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to download image: ${response.statusText}`);
            const buffer = await response.arrayBuffer();
            await fs.writeFile(path, Buffer.from(buffer));
            console.log('Image downloaded and saved to', path);
        } catch (error) {
            console.error('Error downloading and saving image:', error);
            throw new Error(`Failed to download and save image: ${error.message}`);
        }
    }

    async removeBackgroundWithPhotoRoom(imageFilePath, apiKey) {
        const formData = new FormData();
        formData.set('image_file', await fileFromPath(imageFilePath));
        formData.set('format', 'png'); // Optional: specify format
        formData.set('channels', 'rgba'); // Optional: specify channels

        try {
            const response = await axios.post('https://sdk.photoroom.com/v1/segment', formData, {
                headers: {
                    'x-api-key': apiKey,
                },
                responseType: 'arraybuffer' // Ensure the response is in the correct format
            });
            const buffer = Buffer.from(response.data);
            console.log("***Background removed from image");
            return buffer;
        } catch (error) {
            throw new Error(`Failed to remove background: ${error.message}`);
        }
    }

    async cleanup() {
        try {
            const files = await fs.readdir(this.outputDir);
            await Promise.all(
                files.map(file =>
                    fs.unlink(path.join(this.outputDir, file))
                        .catch(error => logger.error(`Failed to delete file ${file}:`, error))
                )
            );
            logger.info('Cleaned up processed images');
        } catch (error) {
            logger.error('Error cleaning up processed images:', error);
            throw error;
        }
    }
}

module.exports = new ImageProcessingService(); 
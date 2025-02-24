const axios = require('axios');
const FormData = require('form-data');
const logger = require('../utils/logger');
const AWS = require('aws-sdk');
const fs = require('fs');
const { App } = require('@slack/bolt');

/**
 * Service for interacting with Discord's API for image generation
 * Flow:
 * 1. Receives image buffer from ImageProcessingService
 * 2. Uploads image to Discord channel
 * 3. Creates an "imagine" command interaction with the uploaded image
 * 4. Waits for Discord to process and generate pixel art
 * 5. Returns URL of generated pixel art image
 */
class ImagineApiService {
    constructor() {
        logger.info('Checking Discord configuration:', {
            hasApiUrl: !!process.env.DISCORD_API_URL,
            hasAppId: !!process.env.DISCORD_APPLICATION_ID,
            hasBotToken: !!process.env.DISCORD_BOT_TOKEN
        });

        const missingVars = [];
        if (!process.env.DISCORD_API_URL) missingVars.push('DISCORD_API_URL');
        if (!process.env.DISCORD_APPLICATION_ID) missingVars.push('DISCORD_APPLICATION_ID');
        if (!process.env.DISCORD_BOT_TOKEN) missingVars.push('DISCORD_BOT_TOKEN');

        if (missingVars.length > 0) {
            throw new Error(`Missing required Discord configuration: ${missingVars.join(', ')}`);
        }

        const baseURL = process.env.DISCORD_API_URL.endsWith('/')
            ? process.env.DISCORD_API_URL
            : `${process.env.DISCORD_API_URL}/`;

        this.api = axios.create({
            baseURL,
            headers: {
                'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
                'Content-Type': 'application/json'
            },
            timeout: 60000,
            httpsAgent: new (require('https').Agent)({
                rejectUnauthorized: false
            })
        });

        this.applicationId = process.env.DISCORD_APPLICATION_ID;
        this.lastRequestTime = 0;
        this.minRequestInterval = 3000;

        if (!process.env.DISCORD_CHANNEL_ID) {
            throw new Error('Missing required Discord configuration: DISCORD_CHANNEL_ID');
        }

        this.channelId = process.env.DISCORD_CHANNEL_ID;
    }

    /**
     * Rate limiting mechanism to prevent Discord API throttling
     * Ensures minimum interval between requests
     */
    async waitForRateLimit() {
        const timeSinceLastRequest = Date.now() - this.lastRequestTime;
        if (timeSinceLastRequest < this.minRequestInterval) {
            await new Promise(resolve =>
                setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
            );
        }
        this.lastRequestTime = Date.now();
    }

    /**
     * Main method for generating pixel art through Discord
     * @param {Buffer} imageBuffer - The original image buffer
     * @param {string} name - Name for the generated file
     * @returns {Promise<string>} URL of the generated pixel art
     */
    async generatePixelArt(imageLink, name, hubspotId) {
        console.log('generatePixelArt', imageLink, name, hubspotId);
        try {

            const imageFolderExists = await this.checkIfImageFolderExistsOnDigitalOceanSpaces(hubspotId);

            if (imageFolderExists) {
                console.log('Image folder already exists on DigitalOcean Spaces');
                const images = await this.getallImagesFromDigitalOceanSpaces(hubspotId);
                return images.map(image => `${process.env.DIGITAL_OCEAN_CDN_ENDPOINT}/${image.Key}`);
            }

            await this.waitForRateLimit();
            logger.info(`Generating pixel art for ${name}`);

            const data = {
                prompt: `https://cdn.midjourney.com/u/e99b14c4-68c3-4b0c-b736-8b629f5a8b22/30bed6d6b2c37085176ac9bcd43bc47dc17b04b2272a4ef8f4a687b2030bff0a.png https://cdn.midjourney.com/u/e99b14c4-68c3-4b0c-b736-8b629f5a8b22/f8fb0dbb96e615c7e753b1258ef2f1773be66d132368b27778296e021e5eb51b.jpg Create a full-body pixel-art sprite of a friend whose image is attached, designed as a character inspired by classic 1980s 2D Mario games. Place the character in a vibrant Super Mario Land-inspired background as a cover photo, incorporating iconic elements such as pixelated clouds, green pipes, brick platforms, and a bright blue sky. The character should be depicted from head to toe in a side-facing pose, standing out in a classic Mario running motion, with all limbs fully visible, including arms, legs, and feet. The design must include bright colors, a cartoonish, expressive face, overalls, a hat, and any unique traits from the provided photo (such as specific hair color or accessories). Position the character running to the right, with arms and legs extended, and wearing black sneakers. Ensure the character and background are cohesive in a retro 8-bit pixel art style, with the entire character and both feet fully visible(Important!!), and no cropped or missing elements. --cref ${imageLink} --v 6.1`,
            };

            const response = await fetch('https://cl.imagineapi.dev/items/images/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.IMAGINE_API_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const responseData = await response.json();
            console.log(responseData);

            if (!responseData?.data?.id) {
                throw new Error(`No image URL received from Imagine Dev API, ${JSON.stringify(data)}`);
            }

            const imageId = responseData.data.id;

            // Use a promise to wait for the image generation to complete
            const imageUrls = await new Promise((resolve, reject) => {
                const startTime = Date.now();
                const intervalId = setInterval(async () => {
                    try {
                        console.log('Checking image details');
                        const statusResponse = await fetch(`https://cl.imagineapi.dev/items/images/${imageId}`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${process.env.IMAGINE_API_TOKEN}`,
                                'Content-Type': 'application/json'
                            }
                        });

                        const statusData = await statusResponse.json();
                        console.log('Image status', statusData.data.status);

                        if (statusData.data.status === 'completed') {
                            clearInterval(intervalId);
                            console.log('Completed image details', statusData.data.url);
                            const upscaledUrls = statusData.data.upscaled_urls;
                            const uploadedUrls = [];

                            for (let i = 0; i < upscaledUrls.length; i++) {
                                const upscaleUrl = upscaledUrls[i];
                                console.log("Uploading image to DigitalOcean Spaces", upscaleUrl, hubspotId, i);
                                const uploadedUrl = await this.uploadToDigitalOceanSpaces(upscaleUrl, hubspotId, i);
                                uploadedUrls.push(uploadedUrl);
                            }

                            resolve(uploadedUrls);
                        } else if (statusData.data.status === 'failed') {
                            clearInterval(intervalId);
                            reject(new Error('Image generation failed'));
                        } else if (statusData.data.status === 'pending' && (Date.now() - startTime) > 600000) { // 10 minutes
                            clearInterval(intervalId);

                            const slackAppInstance = new App({
                                token: process.env.SLACK_BOT_TOKEN,
                                signingSecret: process.env.SLACK_SIGNING_SECRET,
                            });

                            await slackAppInstance.client.chat.postMessage({
                                channel: 'C0851R0H5K2',
                                text: `*Status Update* :hourglass_flowing_sand:\n\n*Profile ID:* \`${hubspotId}\`\nImage link: \`${imageLink}\`\n*Status:* \`Image generation pending for more than 10 minutes\` Please check midjourney and imagine api account for more details and resume the process if needed.`
                            });
                            console.log("Image generation pending for more than 10 minutes. Skipping record.");
                            resolve([]);
                        } else {
                            console.log("Image is not finished generating. Status: ", statusData.data.status);
                        }
                    } catch (error) {
                        console.error('Error getting updates', error);
                        clearInterval(intervalId);
                        reject(error);
                    }
                }, 5000); // every 5 seconds
            });

            console.log('imageUrls', imageUrls);
            return imageUrls;

        } catch (error) {
            console.error('Error generating image:', error);
            throw new Error(`Failed to generate image: ${error.message}`);
        }
    }

    async convertToDirectDownloadLink(driveLink) {
        try {
            const fileIdRegex = /\/d\/([a-zA-Z0-9_-]+)/; // Regex to extract file ID
            const match = driveLink.match(fileIdRegex);

            if (!match || match.length < 2) {
                throw new Error("Invalid Google Drive link format.");
            }

            const fileId = match[1];
            return `https://drive.google.com/uc?export=download&id=${fileId}`;
        } catch (error) {
            console.error("Error converting link:", error.message);
            return null;
        }
    }
    /**
 * Main method for generating pixel art through Discord
 * @param {Buffer} imageBuffer - The original image buffer
 * @param {string} name - Name for the generated file
 * @returns {Promise<string>} URL of the generated pixel art
 */
    async generatePlaceholderArt(imageLink, name, hubspotId) {
        console.log('generatePlaceholderArt', imageLink, name, hubspotId);
        try {

            const imageFolderExists = await this.checkIfPlaceholderImageFolderExistsOnDigitalOceanSpaces(hubspotId);

            if (imageFolderExists) {
                console.log('Placeholder image folder already exists on DigitalOcean Spaces');
                const images = await this.getallPlaceholderImagesFromDigitalOceanSpaces(hubspotId);
                return images.map(image => `${process.env.DIGITAL_OCEAN_CDN_ENDPOINT}/${image.Key}`);
            }

            if (imageLink.includes('drive.google.com')) {

                // Check digital ocean spaces for the image
                const imageExists = await this.checkIfDriveImageExistsOnDigitalOceanSpaces(hubspotId);
                if (imageExists) {
                    imageLink = imageExists;
                } else {
                    imageLink = await this.convertToDirectDownloadLink(imageLink);
                    // Download the image using axios
                    const response = await axios.get(imageLink, { responseType: 'arraybuffer' });
                    const buffer = response.data; // This is the image buffer

                    // Upload the image to DigitalOcean Spaces
                    const uploadedUrl = await this.uploadBufferToDigitalOceanSpaces(buffer, hubspotId, "gdrive_character_image");

                    // Return the uploaded image URL
                    imageLink = uploadedUrl;
                }
            }

            await this.waitForRateLimit();
            logger.info(`Generating pixel art for ${name}`);

            const data = {
                prompt: `https://orbit-bucket.sfo3.cdn.digitaloceanspaces.com/placeholderformat.jpg Create an artwork inspired by a retro 1980 classic 2d video game. It prominently features the main character(pretty and in shape) from the attached picture as mario depicted in a running action pose, arms raised with determination. The background is colorful and vibrant, portraying various landscapes like pyramids, mountains, and underwater scenes, different bright colors, representing different levels in the game. the main character is pretty and in shape is surrounded by various elements and characters: he is flying alongside a jet-like aircraft shooting fireballs and being pursued by enemies, including flying creatures, submarines, and a Moai statue-like character. There are floating platforms and coins in the air, adding to the adventurous theme. --cref ${imageLink} --v 6.1`,
            };

            const response = await fetch('https://cl.imagineapi.dev/items/images/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.IMAGINE_API_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const responseData = await response.json();
            console.log(responseData);

            if (!responseData?.data?.id) {
                throw new Error(`No image URL received from Imagine Dev API, ${JSON.stringify(data)}`);
            }

            const imageId = responseData.data.id;

            // Use a promise to wait for the image generation to complete
            const imageUrls = await new Promise((resolve, reject) => {
                const startTime = Date.now();
                const intervalId = setInterval(async () => {
                    try {
                        console.log('Checking image details');
                        const statusResponse = await fetch(`https://cl.imagineapi.dev/items/images/${imageId}`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${process.env.IMAGINE_API_TOKEN}`,
                                'Content-Type': 'application/json'
                            }
                        });

                        const statusData = await statusResponse.json();
                        console.log('Image status', statusData.data.status);

                        if (statusData.data.status === 'completed') {
                            clearInterval(intervalId);
                            console.log('Completed image details', statusData.data.url);
                            const upscaledUrls = statusData.data.upscaled_urls;
                            const uploadedUrls = [];

                            for (let i = 0; i < upscaledUrls.length; i++) {
                                const upscaleUrl = upscaledUrls[i];
                                console.log("Uploading image to DigitalOcean Spaces", upscaleUrl, hubspotId, i);
                                const uploadedUrl = await this.uploadToDigitalOceanSpaces(upscaleUrl, hubspotId, i, 'artwork');
                                uploadedUrls.push(uploadedUrl);
                            }

                            resolve(uploadedUrls);
                        } else if (statusData.data.status === 'failed') {
                            clearInterval(intervalId);
                            reject(new Error('Image generation failed'));
                        } else if (statusData.data.status === 'pending' && (Date.now() - startTime) > 600000) { // 10 minutes
                            clearInterval(intervalId);

                            const slackAppInstance = new App({
                                token: process.env.SLACK_BOT_TOKEN,
                                signingSecret: process.env.SLACK_SIGNING_SECRET,
                            });

                            await slackAppInstance.client.chat.postMessage({
                                channel: 'C0851R0H5K2',
                                text: `*Status Update* :hourglass_flowing_sand:\n\n*Profile ID:* \`${hubspotId}\`\nImage link: \`${imageLink}\`\n*Status:* \`Image generation pending for more than 10 minutes\` Please check midjourney and imagine api account for more details and resume the process if needed.`
                            });
                            console.log("Image generation pending for more than 10 minutes. Skipping record.");
                            resolve([]);
                        } else {
                            console.log("Image is not finished generating. Status: ", statusData.data.status);
                        }
                    } catch (error) {
                        console.error('Error getting updates', error);
                        clearInterval(intervalId);
                        reject(error);
                    }
                }, 5000); // every 5 seconds
            });

            console.log('imageUrls', imageUrls);
            return imageUrls;

        } catch (error) {
            console.error('Error generating placeholder image:', error);
            throw new Error(`Failed to generate placeholder image: ${error.message}`);
        }
    }

    async getallImagesFromDigitalOceanSpaces(hubspotId) {
        const s3 = new AWS.S3({
            endpoint: new AWS.Endpoint(process.env.DIGITAL_OCEAN_SPACES_ENDPOINT),
            accessKeyId: process.env.DIGITAL_OCEAN_SPACES_ACCESS_KEY,
            secretAccessKey: process.env.DIGITAL_OCEAN_SPACES_SECRET,
            region: process.env.DIGITAL_OCEAN_SPACES_REGION
        });

        const params = {
            Bucket: process.env.DIGITAL_OCEAN_SPACES_BUCKET,
            Prefix: `ecom-generated-images/${hubspotId}/`
        };

        try {
            const data = await s3.listObjectsV2(params).promise();
            console.log('data', data);
            return data.Contents; // Return the image data      
        } catch (error) {
            console.error('Error retrieving image from DigitalOcean Spaces:', error);
            throw new Error(`Failed to retrieve image: ${error.message}`);
        }
    }

    async getallPlaceholderImagesFromDigitalOceanSpaces(hubspotId) {
        const s3 = new AWS.S3({
            endpoint: new AWS.Endpoint(process.env.DIGITAL_OCEAN_SPACES_ENDPOINT),
            accessKeyId: process.env.DIGITAL_OCEAN_SPACES_ACCESS_KEY,
            secretAccessKey: process.env.DIGITAL_OCEAN_SPACES_SECRET,
            region: process.env.DIGITAL_OCEAN_SPACES_REGION
        });

        const params = {
            Bucket: process.env.DIGITAL_OCEAN_SPACES_BUCKET,
            Prefix: `ecom-generated-images/${hubspotId}/artwork/`
        };

        try {
            const data = await s3.listObjectsV2(params).promise();
            console.log('data', data);
            return data.Contents; // Return the image data      
        } catch (error) {
            console.error('Error retrieving image from DigitalOcean Spaces:', error);
            throw new Error(`Failed to retrieve image: ${error.message}`);
        }
    }

    // Check if drive image exists on digital ocean spaces
    async checkIfDriveImageExistsOnDigitalOceanSpaces(hubspotId) {
        const s3 = new AWS.S3({
            endpoint: new AWS.Endpoint(process.env.DIGITAL_OCEAN_SPACES_ENDPOINT),
            accessKeyId: process.env.DIGITAL_OCEAN_SPACES_ACCESS_KEY,
            secretAccessKey: process.env.DIGITAL_OCEAN_SPACES_SECRET,
            region: process.env.DIGITAL_OCEAN_SPACES_REGION
        });

        const params = {
            Bucket: process.env.DIGITAL_OCEAN_SPACES_BUCKET,
            Key: `ecom-generated-images/${hubspotId}/${hubspotId}_gdrive_character_image`
        };

        console.log('Checking if image exists in digital ocean spaces', params);

        try {
            await s3.headObject(params).promise();
            console.log('Image exists in digital ocean spaces', `https://${process.env.DIGITAL_OCEAN_CDN_ENDPOINT}/ecom-generated-images/${hubspotId}/${hubspotId}_gdrive_character_image`);
            // Return the URL of the image if it exists
            return `https://${process.env.DIGITAL_OCEAN_CDN_ENDPOINT}/ecom-generated-images/${hubspotId}/${hubspotId}_gdrive_character_image`;
        } catch (error) {
            if (error.code === 'NotFound') {
                return null; // Image does not exist
            }
            console.error('Error checking if drive image exists on DigitalOcean Spaces:', error);
            return null;
        }
    }

    // Check if background image exists on digital ocean spaces
    async checkIfBackgroundImageExistsOnDigitalOceanSpaces(hubspotId) {
        const s3 = new AWS.S3({
            endpoint: new AWS.Endpoint(process.env.DIGITAL_OCEAN_SPACES_ENDPOINT),
            accessKeyId: process.env.DIGITAL_OCEAN_SPACES_ACCESS_KEY,
            secretAccessKey: process.env.DIGITAL_OCEAN_SPACES_SECRET,
            region: process.env.DIGITAL_OCEAN_SPACES_REGION
        });

        const params = {
            Bucket: process.env.DIGITAL_OCEAN_SPACES_BUCKET,
            Key: `ecom-generated-images/${hubspotId}/${hubspotId}_character_image_no_bg`
        };

        try {
            await s3.headObject(params).promise();
            console.log('Image exists in digital ocean spaces', `https://${process.env.DIGITAL_OCEAN_CDN_ENDPOINT}/ecom-generated-images/${hubspotId}/${hubspotId}_character_image_no_bg`);
            return `https://${process.env.DIGITAL_OCEAN_CDN_ENDPOINT}/ecom-generated-images/${hubspotId}/${hubspotId}_character_image_no_bg`;
        } catch (error) {
            return null;
        }
    }

    async checkIfImageFolderExistsOnDigitalOceanSpaces(hubspotId) {
        const s3 = new AWS.S3({
            endpoint: new AWS.Endpoint(process.env.DIGITAL_OCEAN_SPACES_ENDPOINT),
            accessKeyId: process.env.DIGITAL_OCEAN_SPACES_ACCESS_KEY,
            secretAccessKey: process.env.DIGITAL_OCEAN_SPACES_SECRET,
            region: process.env.DIGITAL_OCEAN_SPACES_REGION
        });

        const params = {
            Bucket: process.env.DIGITAL_OCEAN_SPACES_BUCKET,
            Prefix: `ecom-generated-images/${hubspotId}/`
        };

        try {
            const data = await s3.listObjectsV2(params).promise();
            return data.Contents.length > 0; // Check if there are any objects in the folder
        } catch (error) {
            console.error('Error checking folder existence on DigitalOcean Spaces:', error);
            throw new Error(`Failed to check folder existence: ${error.message}`);
        }
    }


    async checkIfPlaceholderImageFolderExistsOnDigitalOceanSpaces(hubspotId) {
        const s3 = new AWS.S3({
            endpoint: new AWS.Endpoint(process.env.DIGITAL_OCEAN_SPACES_ENDPOINT),
            accessKeyId: process.env.DIGITAL_OCEAN_SPACES_ACCESS_KEY,
            secretAccessKey: process.env.DIGITAL_OCEAN_SPACES_SECRET,
            region: process.env.DIGITAL_OCEAN_SPACES_REGION
        });

        const params = {
            Bucket: process.env.DIGITAL_OCEAN_SPACES_BUCKET,
            Prefix: `ecom-generated-images/${hubspotId}/artwork/`
        };

        try {
            const data = await s3.listObjectsV2(params).promise();
            return data.Contents.length > 0; // Check if there are any objects in the folder
        } catch (error) {
            console.error('Error checking folder existence on DigitalOcean Spaces:', error);
            throw new Error(`Failed to check folder existence: ${error.message}`);
        }
    }

    async getImageById(imageId) {
        try {
            const response = await fetch(`https://cl.imagineapi.dev/items/images/${imageId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${process.env.IMAGINE_API_TOKEN}`, // <<<< TODO: remember to change this
                    'Content-Type': 'application/json'
                }
            });

            const responseData = await response.json();
            console.log(responseData);

            if (!responseData?.data?.url) {
                throw new Error('No image URL received from Imagine Dev API');
            }

            return responseData.data.url;
        } catch (error) {
            console.error('Error retrieving image:', error);
            throw new Error(`Failed to retrieve image: ${error.message}`);
        }
    }

    async uploadToDigitalOceanSpaces(imageUrl, hubspotId, imageIndex, type = null) {
        try {
            const spacesEndpoint = new AWS.Endpoint(process.env.DIGITAL_OCEAN_SPACES_ENDPOINT);
            const s3 = new AWS.S3({
                endpoint: spacesEndpoint,
                accessKeyId: process.env.DIGITAL_OCEAN_SPACES_ACCESS_KEY,
                secretAccessKey: process.env.DIGITAL_OCEAN_SPACES_SECRET,
                region: process.env.DIGITAL_OCEAN_SPACES_REGION
            });

            // Use axios to download the image
            const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const buffer = response.data; // This is the image buffer

            const params = {
                Bucket: process.env.DIGITAL_OCEAN_SPACES_BUCKET,
                Key: !type ? `ecom-generated-images/${hubspotId}/${hubspotId}_${imageIndex + 1}` : `ecom-generated-images/${hubspotId}/${type}/${hubspotId}_${imageIndex + 1}`,
                Body: buffer,
                ACL: 'public-read',
                ContentType: 'image/png'
            };

            console.log('Uploading image to DigitalOcean Spaces:', params);

            console.log('Starting upload...');
            await s3.upload(params).promise();
            console.log('Image uploaded to DigitalOcean Spaces');

            // Return the URL of the uploaded image
            return !type ? `https://${process.env.DIGITAL_OCEAN_CDN_ENDPOINT}/ecom-generated-images/${hubspotId}/${hubspotId}_${imageIndex + 1}` : `https://${process.env.DIGITAL_OCEAN_CDN_ENDPOINT}/ecom-generated-images/${hubspotId}/${type}/${hubspotId}_${imageIndex + 1}`;
        } catch (error) {
            console.error('Error uploading image to DigitalOcean Spaces:', error);
            throw new Error(`Failed to upload image: ${error.message}`);
        }
    }

    async uploadBufferToDigitalOceanSpaces(buffer, hubspotId, name) {
        try {
            const spacesEndpoint = new AWS.Endpoint(process.env.DIGITAL_OCEAN_SPACES_ENDPOINT);
            const s3 = new AWS.S3({
                endpoint: spacesEndpoint,
                accessKeyId: process.env.DIGITAL_OCEAN_SPACES_ACCESS_KEY,
                secretAccessKey: process.env.DIGITAL_OCEAN_SPACES_SECRET,
                region: process.env.DIGITAL_OCEAN_SPACES_REGION
            });

            const params = {
                Bucket: process.env.DIGITAL_OCEAN_SPACES_BUCKET,
                Key: `ecom-generated-images/${hubspotId}/${hubspotId}_${name}`,
                Body: buffer,
                ACL: 'public-read',
                ContentType: 'image/png'
            };

            console.log('Uploading image to DigitalOcean Spaces:', params);

            console.log('Starting upload...');
            await s3.upload(params).promise();
            console.log('Image uploaded to DigitalOcean Spaces');

            const generatedImageUrl = `${process.env.DIGITAL_OCEAN_ORIGIN_ENDPOINT}/ecom-generated-images/${hubspotId}/${hubspotId}_${name}`;

            // Return the URL of the uploaded image
            return generatedImageUrl;
        } catch (error) {
            console.error('Error uploading image to DigitalOcean Spaces:', error);
            throw new Error(`Failed to upload image: ${error.message}`);
        }
    }


    async uploadToLocalFolder(imageUrl, name, imageIndex) {
        try {
            // Use axios to download the image
            const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const buffer = response.data; // This is the image buffer

            // Define the path where the image will be saved
            const dirPath = `generated_images/${name.split('.')[0]}`;
            const filePath = `${dirPath}/${name.split('.')[0]}_${imageIndex + 1}.png`;

            // Ensure the directory exists
            fs.mkdirSync(dirPath, { recursive: true });

            // Write the image buffer to the file system
            fs.writeFileSync(filePath, buffer);

            console.log('Image saved to local folder:', filePath);

            // Return the local file path
            return filePath;
        } catch (error) {
            console.error('Error saving image to local folder:', error);
            throw new Error(`Failed to save image: ${error.message}`);
        }
    }
}

module.exports = new ImagineApiService(); 
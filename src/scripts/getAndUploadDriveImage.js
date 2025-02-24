require('dotenv').config();
const axios = require('axios');
const AWS = require('aws-sdk');

console.log(process.env.DIGITAL_OCEAN_SPACES_ENDPOINT, "***");
console.log(process.env.DIGITAL_OCEAN_SPACES_ACCESS_KEY, "***");
console.log(process.env.DIGITAL_OCEAN_SPACES_SECRET, "***");
console.log(process.env.DIGITAL_OCEAN_SPACES_REGION, "***");
console.log(process.env.DIGITAL_OCEAN_SPACES_BUCKET, "***");
console.log(process.env.DIGITAL_OCEAN_CDN_ENDPOINT, "***");

const convertToDirectDownloadLink = async (driveLink) => {
    console.log("Converting Google Drive link to direct download link...");
    try {
        const fileIdRegex = /\/d\/([a-zA-Z0-9_-]+)/; // Regex to extract file ID
        const match = driveLink.match(fileIdRegex);

        if (!match || match.length < 2) {
            console.error("Invalid Google Drive link format.");
            throw new Error("Invalid Google Drive link format.");
        }

        const fileId = match[1];
        const directLink = `https://drive.google.com/uc?export=download&id=${fileId}`;
        console.log("Direct download link created:", directLink);
        return directLink;
    } catch (error) {
        console.error("Error converting link:", error.message);
        return null;
    }
}

const uploadToDigitalOceanSpaces = async (buffer, imageIndex, type = null) => {
    console.log("Preparing to upload image to DigitalOcean Spaces...");
    try {
        const spacesEndpoint = new AWS.Endpoint(process.env.DIGITAL_OCEAN_SPACES_ENDPOINT);
        console.log("Spaces Endpoint:", spacesEndpoint.href); // Log the endpoint URL

        const s3 = new AWS.S3({
            endpoint: spacesEndpoint,
            accessKeyId: process.env.DIGITAL_OCEAN_SPACES_ACCESS_KEY,
            secretAccessKey: process.env.DIGITAL_OCEAN_SPACES_SECRET,
            region: process.env.DIGITAL_OCEAN_SPACES_REGION
        });

        // console.log("Downloading image from URL:", imageUrl);
        // const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        // const buffer = response.data; // This is the image buffer
        // console.log("Image downloaded successfully.");

        const params = {
            Bucket: process.env.DIGITAL_OCEAN_SPACES_BUCKET,
            Key: `test/test_${imageIndex + 1}.png`,
            Body: buffer,
            ACL: 'public-read',
            ContentType: 'image/png'
        };

        console.log('Uploading image to DigitalOcean Spaces with params:', params);
        console.log('Starting upload...');
        await s3.upload(params).promise();
        console.log('Image uploaded to DigitalOcean Spaces successfully.');

        const uploadedUrl = `https://${process.env.DIGITAL_OCEAN_CDN_ENDPOINT}/test/test_${imageIndex + 1}.png`;
        console.log("Uploaded image URL:", uploadedUrl);
        return uploadedUrl;
    } catch (error) {
        console.error('Error uploading image to DigitalOcean Spaces:', error);
        throw new Error(`Failed to upload image: ${error.message}`);
    }
}

const getAndUploadDriveImage = async () => {
    console.log("Starting process to get and upload Google Drive image...");
    const imageLink = 'https://drive.google.com/file/d/1VzN9jqNIC63FPKRNuVktAQfYFMmxrP4i/view?usp=sharing';

    if (imageLink.includes('drive.google.com')) {
        console.log("Google Drive link detected:", imageLink);
        const newImageLink = await convertToDirectDownloadLink(imageLink);
        if (newImageLink) {
            console.log("Downloading image from direct link...");
            const response = await axios.get(newImageLink, { responseType: 'arraybuffer' });
            const buffer = response.data; // This is the image buffer
            console.log("Image downloaded successfully.");

            console.log("Uploading image to DigitalOcean Spaces...");
            const uploadedUrl = await uploadToDigitalOceanSpaces(buffer, 50);
            console.log("Image uploaded successfully. URL:", uploadedUrl);

            return uploadedUrl;
        } else {
            console.error("Failed to convert Google Drive link to direct download link.");
        }
    } else {
        console.error("Provided link is not a Google Drive link.");
    }
}

getAndUploadDriveImage();
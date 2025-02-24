require('dotenv').config();
const AWS = require('aws-sdk');
const logger = require('../utils/logger');

// Configure AWS SDK for DigitalOcean Spaces
const spacesEndpoint = new AWS.Endpoint(process.env.DIGITAL_OCEAN_SPACES_ENDPOINT);
const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: process.env.DIGITAL_OCEAN_SPACES_ACCESS_KEY,
    secretAccessKey: process.env.DIGITAL_OCEAN_SPACES_SECRET,
    region: process.env.DIGITAL_OCEAN_SPACES_REGION
});

async function deletePlaceholderFolders(bucket) {
    try {
        let continuationToken;
        do {
            const params = {
                Bucket: bucket,
                ContinuationToken: continuationToken,
                Prefix: '' // Adjust if you want to limit the search to a specific path
            };

            const data = await s3.listObjectsV2(params).promise();
            logger.info(`Fetched ${data.Contents.length} items from bucket ${bucket}`);

            const deletePromises = data.Contents.map(item => {
                // Check if the item is a "placeholder" folder
                if (item.Key.endsWith('placeholder/')) {
                    const deleteParams = {
                        Bucket: bucket,
                        Key: item.Key
                    };
                    return s3.deleteObject(deleteParams).promise().then(() => {
                        logger.info(`Deleted folder: ${item.Key}`);
                    });
                }
            });

            await Promise.all(deletePromises);

            continuationToken = data.NextContinuationToken;
        } while (continuationToken);

        logger.info('All placeholder folders deleted successfully');
    } catch (error) {
        logger.error('Error deleting placeholder folders:', error);
        throw error;
    }
}

// Usage
(async () => {
    const bucketName = process.env.DIGITAL_OCEAN_SPACES_BUCKET;

    try {
        await deletePlaceholderFolders(bucketName);
    } catch (error) {
        console.error('Failed to delete placeholder folders:', error);
    }
})();
require('dotenv').config();
const AWS = require('aws-sdk');
const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const logger = require('../utils/logger');

// Configure AWS SDK for DigitalOcean Spaces
const spacesEndpoint = new AWS.Endpoint(process.env.DIGITAL_OCEAN_SPACES_ENDPOINT);
const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: process.env.DIGITAL_OCEAN_SPACES_ACCESS_KEY,
    secretAccessKey: process.env.DIGITAL_OCEAN_SPACES_SECRET,
    region: process.env.DIGITAL_OCEAN_SPACES_REGION
});

async function downloadFile(bucket, key, downloadDir) {
    try {
        // Recreate directory structure locally
        const filePath = path.join(downloadDir, key);
        const dir = path.dirname(filePath);

        // Ensure the directory exists
        await fsPromises.mkdir(dir, { recursive: true });

        // Download the file
        const params = { Bucket: bucket, Key: key };
        const fileStream = s3.getObject(params).createReadStream();
        const writeStream = fs.createWriteStream(filePath);

        return new Promise((resolve, reject) => {
            fileStream.pipe(writeStream)
                .on('error', reject)
                .on('close', () => {
                    logger.info(`Downloaded: ${key} to ${filePath}`);
                    resolve();
                });
        });
    } catch (error) {
        logger.error(`Error downloading file: ${key}`, error);
        throw error;
    }
}

async function downloadAllFilesFromBucket(bucket, downloadDir) {
    try {
        let continuationToken;
        do {
            const params = {
                Bucket: bucket,
                ContinuationToken: continuationToken,
                Prefix: 'ecom-ai-images/' // Ensure only relevant files are fetched
            };

            const data = await s3.listObjectsV2(params).promise();
            logger.info(`Fetched ${data.Contents.length} items from bucket ${bucket}`);

            const downloadPromises = data.Contents.map(item => {
                // Ensure item is not a directory marker
                if (!item.Key.endsWith('/')) {
                    return downloadFile(bucket, item.Key, downloadDir);
                }
            });

            await Promise.all(downloadPromises);

            continuationToken = data.NextContinuationToken;
        } while (continuationToken);

        logger.info('All files downloaded successfully');
    } catch (error) {
        logger.error('Error downloading files:', error);
        throw error;
    }
}

// Usage
(async () => {
    const bucketName = process.env.DIGITAL_OCEAN_SPACES_BUCKET;
    const downloadDirectory = path.join(process.cwd(), 'downloaded_files');

    try {
        await downloadAllFilesFromBucket(bucketName, downloadDirectory);
    } catch (error) {
        console.error('Failed to download files:', error);
    }
})();

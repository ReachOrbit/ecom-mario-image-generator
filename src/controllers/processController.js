const csvService = require('../services/csvService');
const linkedinService = require('../services/linkedinService');
const imageProcessingService = require('../services/imageProcessingService');
const logger = require('../utils/logger');
const AWS = require('aws-sdk');
const { downloadResults, uploadToDigitalOceanSpaces, downloadPlaceholderArtResults, downloadCharacterImageNoBgResults } = require('../utils/fileUtils');
const { App } = require('@slack/bolt');
const path = require('path');
/**
 * Controller managing the entire profile processing flow
 * Complete Flow:
 * 1. Receives CSV file with LinkedIn URLs
 * 2. For each URL:
 *    a. Validates LinkedIn URL format
 *    b. Fetches profile data from LinkedIn API
 *    c. Downloads profile picture
 *    d. Processes original image
 *    e. Sends to Discord for pixel art generation
 *    f. Downloads and saves generated pixel art
 * 3. Streams progress updates to client
 * 4. Returns final results with all processed images
 */
class ProcessController {
    async processProfiles(req, res, next) {

        const slackAppInstance = new App({
            token: process.env.SLACK_BOT_TOKEN,
            signingSecret: process.env.SLACK_SIGNING_SECRET,
        });

        try {
            if (!req.file) {
                throw new Error('No CSV file uploaded');
            }
            // Set up streaming response headers
            res.writeHead(200, {
                'Content-Type': 'text/plain',
                'Transfer-Encoding': 'chunked',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            });

            const startTime = new Date();
            let processedCount = 0;
            logger.info('Starting profile processing');

            // Set up a timer to send status updates every 5 minutes
            const statusInterval = setInterval(async () => {
                const remainingCount = totalProfiles - processedCount;
                try {
                    const percentage = ((processedCount / totalProfiles) * 100).toFixed(2);
                    await slackAppInstance.client.chat.postMessage({
                        channel: 'C0851R0H5K2',
                        text: `*Pixel Art Processing* :hourglass_flowing_sand:\n\n` +
                              `*File Name:* \`${req.file.originalname}\`\n` +
                              `*Processed Profiles:* \`${processedCount}\`\n` +
                              `*Remaining Profiles:* \`${remainingCount}\`\n` +
                              `*Completion:* \`${percentage}%\``
                    });
                } catch (error) {
                    console.error('Error sending status update to Slack:', error);
                }
            }, 45 * 60 * 1000); // 45 minutes in milliseconds

            // Process CSV file
            const profiles = await csvService.processFile(req.file.path);

            console.log('Profiles:', profiles.length);
            console.log('Profiles:', profiles.map(profile => profile.hubspotId));
            const batchSize = 10; // Number of profiles to process in parallel
            const totalProfiles = profiles.length;
            const results = [];

            logger.info(`Processing ${totalProfiles} profiles in batches of ${batchSize}`);

            for (let i = 0; i < profiles.length; i += batchSize) {
                const batch = profiles.slice(i, i + batchSize);

                // Process each batch in parallel
                const batchResults = await Promise.all(batch.map(async (profile, index) => {
                    try {
                        // Validate LinkedIn URL
                        if (!await linkedinService.validateUrl(profile.linkedinUrl)) {
                            return {
                                url: profile.linkedinUrl,
                                status: 'failed',
                                error: 'Invalid LinkedIn URL format'
                            };
                        }

                        let profileData = profile;

                        // If profile picture is not available, fetch from LinkedIn
                        if (!profileData.profilePicture) {
                            console.log('Fetching profile data from LinkedIn for:', profile.linkedinUrl);
                            profileData = await linkedinService.getProfileData(profile.linkedinUrl);
                        }

                        // If profile picture is still not available, skip the profile
                        if (!profileData.profilePicture) {
                            return {
                                url: profile.linkedinUrl,
                                status: 'failed',
                                error: 'No profile picture URL available'
                            };
                        }

                        // Process profile picture
                        const processedImagePath = await imageProcessingService.processProfilePicture(
                            profileData.profilePicture,
                            profileData.fullName.replace(/\s+/g, '_'),
                            profile.hubspotId
                        );

                        return {
                            url: profile.linkedinUrl,
                            status: 'success',
                            pixelArtUrls: processedImagePath.pixelArtUrls,
                            profilePicture: profileData.profilePicture
                        };

                    } catch (error) {
                        logger.error(`Error processing profile ${profile.linkedinUrl}:`, error);
                        return {
                            url: profile.linkedinUrl,
                            status: 'failed',
                            error: error.message
                        };
                    }
                }));

                results.push(...batchResults);
                processedCount += batchResults.length;

                // Send progress update with newline
                const progress = processedCount / totalProfiles;
                logger.info(`Sending progress update: ${Math.round(progress * 100)}%`);
                res.write(JSON.stringify({ progress }) + '\n');
            }

            // Clear the interval once processing is complete
            clearInterval(statusInterval);

            // Send final results with newline
            logger.info('Sending final results');
            res.write(JSON.stringify({ results }) + '\n');
            res.end();

            // Generate CSV content
            const csvContent = await downloadResults(results, req.file.path);

            // Upload CSV to storage and get download link
            const fileNameWithoutExt = path.basename(req.file.originalname, path.extname(req.file.originalname));
            const downloadLink = await uploadToDigitalOceanSpaces(AWS, csvContent, 'character_image_pixel_art_results_' + fileNameWithoutExt.toLowerCase().split(' ').join('_'));

            console.log('Download link:', downloadLink);

            const completedAt = new Date();
            const timeTaken = `${((completedAt - startTime) / 1000).toFixed(2)} seconds`;

            // Format the start and completed times
            const formattedStartTime = new Intl.DateTimeFormat('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short'
            }).format(startTime);

            const formattedCompletedAt = new Intl.DateTimeFormat('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short'
            }).format(completedAt);

            try {
                await slackAppInstance.client.chat.postMessage({
                    channel: 'C0851R0H5K2',
                    text: `*Pixel Art Processing Complete!* :white_check_mark:\n\n*File Name:* \`${req.file.originalname}\`\n *Started At:* \`${formattedStartTime}\`\n *Completed At:* \`${formattedCompletedAt}\`\n *Processing Time:* \`${timeTaken}\`\n *Total Profiles Processed:* \`${totalProfiles}\`\n\n<${downloadLink}|⬇️ Download Results>`,
                });
            } catch (error) {
                console.error('Error sending message to Slack:', error);
            }
        } catch (error) {
            logger.error('Error in processProfiles:', error);

            // Send error report to Slack if the entire process fails
            try {
                await slackAppInstance.client.chat.postMessage({
                    channel: 'C0851R0H5K2',
                    text: `*Error in Profile Processing* :x:\n\n*Error:* \`${error.message}\``,
                });
            } catch (slackError) {
                console.error('Error sending error report to Slack:', slackError);
            }
            next(error);
        }
    }

    async processProfilesWithCharacterImagesAlreadyIncluded(req, res, next) {

        const slackAppInstance = new App({
            token: process.env.SLACK_BOT_TOKEN,
            signingSecret: process.env.SLACK_SIGNING_SECRET,
        });

        try {
            if (!req.file) {
                throw new Error('No CSV file uploaded');
            }
            // Set up streaming response headers
            res.writeHead(200, {
                'Content-Type': 'text/plain',
                'Transfer-Encoding': 'chunked',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            });

            const startTime = new Date();
            let processedCount = 0;
            logger.info('Starting profile processing');

            // Set up a timer to send status updates every 5 minutes
            const statusInterval = setInterval(async () => {
                const remainingCount = totalProfiles - processedCount;
                try {
                    const percentage = ((processedCount / totalProfiles) * 100).toFixed(2);
                    await slackAppInstance.client.chat.postMessage({
                        channel: 'C0851R0H5K2',
                        text: `*Placeholder Art Processing* :hourglass_flowing_sand:\n\n` +
                              `*File Name:* \`${req.file.originalname}\`\n` +
                              `*Processed Profiles:* \`${processedCount}\`\n` +
                              `*Remaining Profiles:* \`${remainingCount}\`\n` +
                              `*Completion:* \`${percentage}%\``,
                    });
                } catch (error) {
                    console.error('Error sending status update to Slack:', error);
                }
            }, 45 * 60 * 1000); // 45 minutes in milliseconds

            // Process CSV file
            const profiles = await csvService.processFileWithCharacterImagesAlreadyIncluded(req.file.path);
            const batchSize = 10; // Number of profiles to process in parallel
            const totalProfiles = profiles.length;
            const results = [];

            logger.info(`Processing ${totalProfiles} profiles in batches of ${batchSize}`);
              // Notify Slack that processing has started
              try {
                await slackAppInstance.client.chat.postMessage({
                    channel: 'C0851R0H5K2',
                    text: `*Placeholder Art Generation Process Started* :rocket:\n\n*File Name:* \`${req.file.originalname}\``,
                });
            } catch (error) {
                console.error('Error sending start message to Slack:', error);
            }

            for (let i = 0; i < profiles.length; i += batchSize) {
                const batch = profiles.slice(i, i + batchSize);

                // Process each batch in parallel
                const batchResults = await Promise.all(batch.map(async (profile, index) => {
                    try {
                        // Validate LinkedIn URL
                        // if (!await linkedinService.validateUrl(profile.linkedinUrl)) {
                        //     return {
                        //         url: profile.linkedinUrl,
                        //         status: 'failed',
                        //         error: 'Invalid LinkedIn URL format'
                        //     };
                        // }

                        let profileData = profile;

                        // // If profile picture is not available, fetch from LinkedIn
                        // if (!profileData.profilePicture) {
                        //     console.log('Fetching profile data from LinkedIn for:', profile.linkedinUrl);
                        //     profileData = await linkedinService.getProfileData(profile.linkedinUrl);
                        // }

                        // If profile picture is still not available, skip the profile
                        if (!profileData.characterImgMario) {
                            return {
                                url: profile.linkedinUrl,
                                status: 'failed',
                                error: 'No character image available'
                            };
                        }

                        // Process profile picture
                        const processedImagePath = await imageProcessingService.processProfilePictureWithCharacterImageAlreadyIncluded(
                            profileData.characterImgMario,
                            profileData.fullName.replace(/\s+/g, '_'),
                            profile.hubspotId
                        );

                        return {
                            url: profile.linkedinUrl,
                            status: 'success',
                            placeholderArtUrls: processedImagePath.placeholderArtUrls,
                            profilePicture: profileData.characterImgMario
                        };

                    } catch (error) {
                        logger.error(`Error processing profile ${profile.linkedinUrl}:`, error);
                        return {
                            url: profile.linkedinUrl,
                            status: 'failed',
                            error: error.message
                        };
                    }
                }));

                results.push(...batchResults);
                processedCount += batchResults.length;

                // Send progress update with newline
                const progress = processedCount / totalProfiles;
                logger.info(`Sending progress update: ${Math.round(progress * 100)}%`);
                res.write(JSON.stringify({ progress }) + '\n');
            }

            // Clear the interval once processing is complete
            clearInterval(statusInterval);

            // Send final results with newline
            logger.info('Sending final results');
            res.write(JSON.stringify({ results }) + '\n');
            res.end();

            // Generate CSV content
            const csvContent = await downloadPlaceholderArtResults(results, req.file.path);

            // Upload CSV to storage and get download link
            const fileNameWithoutExt = path.basename(req.file.originalname, path.extname(req.file.originalname));
            const downloadLink = await uploadToDigitalOceanSpaces(AWS, csvContent, 'placeholder_art_results_' + fileNameWithoutExt.toLowerCase().split(' ').join('_'));

            console.log('Download link:', downloadLink);

            const completedAt = new Date();
            const timeTaken = `${((completedAt - startTime) / 1000).toFixed(2)} seconds`;

            // Format the start and completed times
            const formattedStartTime = new Intl.DateTimeFormat('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short'
            }).format(startTime);

            const formattedCompletedAt = new Intl.DateTimeFormat('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short'
            }).format(completedAt);

            try {
                await slackAppInstance.client.chat.postMessage({
                    channel: 'C0851R0H5K2',
                    text: `*Placeholder Art Processing Complete!* :white_check_mark:\n\n*File Name:* \`${req.file.originalname}\`\n *Started At:* \`${formattedStartTime}\`\n *Completed At:* \`${formattedCompletedAt}\`\n *Processing Time:* \`${timeTaken}\`\n *Total Profiles Processed:* \`${totalProfiles}\`\n\n<${downloadLink}|⬇️ Download Results>`,
                });
            } catch (error) {
                console.error('Error sending message to Slack:', error);
            }
        } catch (error) {
            logger.error('Error in processProfiles:', error);

            // Send error report to Slack if the entire process fails
            try {
                await slackAppInstance.client.chat.postMessage({
                    channel: 'C0851R0H5K2',
                    text: `*Error in Placeholder Art Processing* :x:\n\n*Error:* \`${error.message}\``,
                });
            } catch (slackError) {
                console.error('Error sending error report to Slack:', slackError);
            }
            next(error);
        }
    }

    async processProfilesAndRemoveBackgroundFromCharacterImages(req, res, next) {

        const slackAppInstance = new App({
            token: process.env.SLACK_BOT_TOKEN,
            signingSecret: process.env.SLACK_SIGNING_SECRET,
        });

        try {
            if (!req.file) {
                throw new Error('No CSV file uploaded');
            }
            // Set up streaming response headers
            res.writeHead(200, {
                'Content-Type': 'text/plain',
                'Transfer-Encoding': 'chunked',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            });

            const startTime = new Date();
            let processedCount = 0;
            logger.info('Starting profile processing');

            // Set up a timer to send status updates every 5 minutes
            const statusInterval = setInterval(async () => {
                const remainingCount = totalProfiles - processedCount;
                try {
                    const percentage = ((processedCount / totalProfiles) * 100).toFixed(2);
                    await slackAppInstance.client.chat.postMessage({
                        channel: 'C0851R0H5K2',
                        text: `*Status Update* :hourglass_flowing_sand:\n\n` +
                              `*File Name:* \`${req.file.originalname}\`\n` +
                              `*Processed Profiles:* \`${processedCount}\`\n` +
                              `*Remaining Profiles:* \`${remainingCount}\`\n` +
                              `*Completion:* \`${percentage}%\``,
                    });
                } catch (error) {
                    console.error('Error sending status update to Slack:', error);
                }
            }, 45 * 60 * 1000); // 45 minutes in milliseconds

            // Process CSV file
            const profiles = await csvService.processFileWithCharacterImagesAlreadyIncludedForBackgroundRemoval(req.file.path);
            const batchSize = 10; // Number of profiles to process in parallel
            const totalProfiles = profiles.length;
            const results = [];

            logger.info(`Processing ${totalProfiles} profiles in batches of ${batchSize}`);
              // Notify Slack that processing has started
              try {
                await slackAppInstance.client.chat.postMessage({
                    channel: 'C0851R0H5K2',
                    text: `*Character Image Background Removal Process Started* :rocket:\n\n*File Name:* \`${req.file.originalname}\``,
                });
            } catch (error) {
                console.error('Error sending start message to Slack:', error);
            }

            for (let i = 0; i < profiles.length; i += batchSize) {
                const batch = profiles.slice(i, i + batchSize);

                // Process each batch in parallel
                const batchResults = await Promise.all(batch.map(async (profile, index) => {
                    try {
                        // Validate LinkedIn URL
                        // if (!await linkedinService.validateUrl(profile.linkedinUrl)) {
                        //     return {
                        //         url: profile.linkedinUrl,
                        //         status: 'failed',
                        //         error: 'Invalid LinkedIn URL format'
                        //     };
                        // }

                        let profileData = profile;

                        // // If profile picture is not available, fetch from LinkedIn
                        // if (!profileData.profilePicture) {
                        //     console.log('Fetching profile data from LinkedIn for:', profile.linkedinUrl);
                        //     profileData = await linkedinService.getProfileData(profile.linkedinUrl);
                        // }

                        // If profile picture is still not available, skip the profile
                        if (!profileData.characterImgMario) {
                            return {
                                url: profile.linkedinUrl,
                                status: 'failed',
                                error: 'No character image available'
                            };
                        }

                        // Process profile picture
                        const processedImageUrl = await imageProcessingService.removeBackgroundFromCharacterImage(
                            profileData.characterImgMario,
                            profileData.fullName.replace(/\s+/g, '_'),
                            profile.hubspotId
                        );

                        return {
                            url: profile.linkedinUrl,
                            status: 'success',
                            characterImgNoBg: processedImageUrl,
                            profilePicture: profileData.characterImgMario
                        };

                    } catch (error) {
                        logger.error(`Error processing profile ${profile.linkedinUrl}:`, error);
                        return {
                            url: profile.linkedinUrl,
                            status: 'failed',
                            error: error.message
                        };
                    }
                }));

                results.push(...batchResults);
                processedCount += batchResults.length;

                // Send progress update with newline
                const progress = processedCount / totalProfiles;
                logger.info(`Sending progress update: ${Math.round(progress * 100)}%`);
                res.write(JSON.stringify({ progress }) + '\n');
            }

            // Clear the interval once processing is complete
            clearInterval(statusInterval);

            // Send final results with newline
            logger.info('Sending final results');
            res.write(JSON.stringify({ results }) + '\n');
            res.end();

            // Generate CSV content
            const csvContent = await downloadCharacterImageNoBgResults(results, req.file.path);

            // Upload CSV to storage and get download link
            const fileNameWithoutExt = path.basename(req.file.originalname, path.extname(req.file.originalname));
            const downloadLink = await uploadToDigitalOceanSpaces(AWS, csvContent, 'character_image_no_bg_results_' + fileNameWithoutExt.toLowerCase().split(' ').join('_'));

            console.log('Download link:', downloadLink);

            const completedAt = new Date();
            const timeTaken = `${((completedAt - startTime) / 1000).toFixed(2)} seconds`;

            // Format the start and completed times
            const formattedStartTime = new Intl.DateTimeFormat('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short'
            }).format(startTime);

            const formattedCompletedAt = new Intl.DateTimeFormat('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short'
            }).format(completedAt);

            try {
                await slackAppInstance.client.chat.postMessage({
                    channel: 'C0851R0H5K2',
                    text: `*Character Image Background Removal Complete!* :white_check_mark:\n\n*File Name:* \`${req.file.originalname}\`\n *Started At:* \`${formattedStartTime}\`\n *Completed At:* \`${formattedCompletedAt}\`\n *Processing Time:* \`${timeTaken}\`\n *Total Profiles Processed:* \`${totalProfiles}\`\n\n<${downloadLink}|⬇️ Download Results>`,
                });
            } catch (error) {
                console.error('Error sending message to Slack:', error);
            }
        } catch (error) {
            logger.error('Error in processProfilesAndRemoveBackgroundFromCharacterImages:', error);

            // Send error report to Slack if the entire process fails
            try {
                await slackAppInstance.client.chat.postMessage({
                    channel: 'C0851R0H5K2',
                    text: `*Error in Character Image Background Removal* :x:\n\n*Error:* \`${error.message}\``,
                });
            } catch (slackError) {
                console.error('Error sending error report to Slack:', slackError);
            }
            next(error);
        }
    }
}

module.exports = new ProcessController(); 
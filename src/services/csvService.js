const csv = require('csv-parser');
const fs = require('fs');
const logger = require('../utils/logger');

class CsvService {
    async processFile(filePath) {
        try {
            const results = [];

            return new Promise((resolve, reject) => {
                fs.createReadStream(filePath)
                    .pipe(csv({
                        mapHeaders: ({ header }) => header.trim().toLowerCase(),
                        mapValues: ({ header, value }) => value.trim()
                    }))
                    .on('data', (data) => {
                        logger.info('Processing CSV row:', data);

                        // Check if the row has a status of 'failed'
                        if (data && data['profilepicture'] && data['record id - contact']) {
                            // Check if the URL exists in any of the columns
                            const url = data.linkedinurl.includes('linkedin.com/in/') ? data.linkedinurl : null;
                            const hubspotId = data['record id - contact'];
                            const profilePicture = data['profilepicture'];
                            const fullName = ((data['first name'] || '') + ' ' + (data['last name'] || '')).trim();

                            if (url) {
                                results.push({
                                    linkedinUrl: url,
                                    status: 'pending',
                                    hubspotId: hubspotId,
                                    profilePicture: profilePicture,
                                    fullName: fullName
                                });
                                logger.info('Added URL:', url);
                            } else {
                                logger.warn('No LinkedIn URL found in row:', data);
                            }
                        } else {
                            logger.info('Skipping row with non-failed status:', data);
                        }
                    })
                    .on('end', () => {
                        logger.info(`Processed ${results.length} valid URLs`);

                        if (results.length === 0) {
                            reject(new Error('No valid LinkedIn URLs found in CSV'));
                        } else {
                            resolve(results);
                        }
                    })
                    .on('error', (error) => {
                        logger.error('Error processing CSV:', error);
                        reject(error);
                    });
            });
        } catch (error) {
            logger.error('CSV processing error:', error);
            throw error;
        }
    }

    async processFileWithCharacterImagesAlreadyIncluded(filePath) {
        try {
            const results = [];

            return new Promise((resolve, reject) => {
                fs.createReadStream(filePath)
                    .pipe(csv({
                        mapHeaders: ({ header }) => header.trim().toLowerCase(),
                        mapValues: ({ header, value }) => value.trim()
                    }))
                    .on('data', (data) => {

                        const characterImgMario = data['character img mario'] || '';
                        const placeholderImgMario = data['placeholder img mario'] || '';
                        const recordId = data['record id - contact'] || '';

                        const isCharacterImgMarioValid = (typeof characterImgMario === 'string' && characterImgMario.length > 0 && characterImgMario !== 'NONE');
                        console.info('***isCharacterImgMarioValid: ', characterImgMario, isCharacterImgMarioValid);
                        
                        const isPlaceholderImgMarioValid = (!placeholderImgMario || (typeof placeholderImgMario === 'string' && placeholderImgMario.trim().length === 0));
                        console.info('***isPlaceholderImgMarioValid: ', isPlaceholderImgMarioValid);
                        if (
                            data && recordId &&
                            isCharacterImgMarioValid &&
                            isPlaceholderImgMarioValid
                        ) {
                            console.info('***Processing CSV row: ', recordId);
                            const url = data.linkedinurl && data.linkedinurl.includes('linkedin.com/in/') ? data.linkedinurl : null;
                            const hubspotId = data['record id - contact'];
                            const profilePicture = data['profilepicture'];
                            const fullName = `${data['first name'] || ''} ${data['last name'] || ''}`.trim();

                            if (url) {
                                results.push({
                                    linkedinUrl: url,
                                    status: 'pending',
                                    hubspotId: hubspotId,
                                    profilePicture: profilePicture,
                                    fullName: fullName,
                                    characterImgMario: characterImgMario
                                });
                                console.info('Added URL:', url);
                            } else {
                                console.warn('No LinkedIn URL found in row:', recordId);
                            }
                        } else {
                            console.info('Skipping row as it does not have Character Img Mario or other required fields:', recordId);
                        }
                    })
                    .on('end', () => {
                        console.info(`Processed ${results.length} valid URLs`);
                        if (results.length === 0) {
                            reject(new Error('No valid character images found in CSV'));
                        } else {
                            resolve(results);
                        }
                    })
                    .on('error', (error) => {
                        console.error('Error processing CSV:', error);
                        reject(error);
                    });
            });
        } catch (error) {
            console.error('CSV processing error:', error);
            throw error;
        }
    }

    async processFileWithCharacterImagesAlreadyIncludedForBackgroundRemoval(filePath) {
        try {
            const results = [];

            return new Promise((resolve, reject) => {
                fs.createReadStream(filePath)
                    .pipe(csv({
                        mapHeaders: ({ header }) => header.trim().toLowerCase(),
                        mapValues: ({ header, value }) => value.trim()
                    }))
                    .on('data', (data) => {

                        const characterImgMario = data['character img mario'];
                        const recordId = data['record id - contact'];

                        const isCharacterImgMarioValid = (typeof characterImgMario === 'string' && characterImgMario.length > 0 && characterImgMario !== 'NONE');

                        if (
                            data && recordId &&
                            isCharacterImgMarioValid
                        ) {
                            const url = data.linkedinurl && data.linkedinurl.includes('linkedin.com/in/') ? data.linkedinurl : null;
                            const hubspotId = data['record id - contact'];
                            const profilePicture = data['profilepicture'];
                            const fullName = `${data['first name'] || ''} ${data['last name'] || ''}`.trim();

                            if (url) {
                                results.push({
                                    linkedinUrl: url,
                                    status: 'pending',
                                    hubspotId: hubspotId,
                                    profilePicture: profilePicture,
                                    fullName: fullName,
                                    characterImgMario: characterImgMario
                                });
                                console.info('Added URL:', url);
                            } else {
                                console.warn('No LinkedIn URL found in row:', data);
                            }
                        } else {
                            console.info('Skipping row as it does not have Character Img Mario or other required fields:', data);
                        }
                    })
                    .on('end', () => {
                        console.info(`Processed ${results.length} valid URLs`);
                        if (results.length === 0) {
                            reject(new Error('No valid character images found in CSV'));
                        } else {
                            resolve(results);
                        }
                    })
                    .on('error', (error) => {
                        console.error('Error processing CSV:', error);
                        reject(error);
                    });
            });
        } catch (error) {
            console.error('CSV processing error:', error);
            throw error;
        }
    }

}

module.exports = new CsvService(); 
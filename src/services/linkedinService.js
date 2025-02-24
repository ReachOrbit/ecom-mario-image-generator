const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Service for handling LinkedIn API interactions
 * Flow:
 * 1. Receives LinkedIn profile URL
 * 2. Extracts username from URL
 * 3. Makes API request to LinkedIn API
 * 4. Returns profile data including profile picture URL
 */
class LinkedinService {
    constructor() {
        this.api = axios.create({
            baseURL: 'https://linkedin-api8.p.rapidapi.com',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-rapidapi-ua': 'RapidAPI-Playground',
                'x-rapidapi-key': '89bc35bccamshd5703461fd24955p166e2bjsn812882ebf518',
                'x-rapidapi-host': 'linkedin-api8.p.rapidapi.com'
            },
            timeout: 60000
        });

        this.queue = [];
        this.processing = false;
        this.lastRequestTime = 0;
        this.minRequestInterval = 3000;
        this.maxRetries = 3;
    }

    async getProfileData(url) {
        return new Promise((resolve, reject) => {
            this.queue.push({ url, resolve, reject, retries: 0 });
            this.processQueue();
        });
    }

    async processQueue() {
        if (this.processing || this.queue.length === 0) return;
        
        this.processing = true;
        
        while (this.queue.length > 0) {
            const request = this.queue[0];
            
            try {
                await this.waitForRateLimit();
                const data = await this.makeRequest(request.url);
                request.resolve(data);
                this.queue.shift();
            } catch (error) {
                if (error.response?.status === 429 && request.retries < this.maxRetries) {
                    request.retries++;
                    await new Promise(resolve => setTimeout(resolve, 3000 * request.retries));
                    continue;
                }
                
                request.reject(error);
                this.queue.shift();
            }
        }
        
        this.processing = false;
    }

    async makeRequest(url) {
        try {
            this.lastRequestTime = Date.now();
            const username = this.extractProfileId(url);
            
            logger.info(`Making API request for username: ${username}`);
            
            const response = await this.api.get('/', {
                params: { 
                    username: username
                }
            });

            logger.info('Checking for profilePicture at:', {
                hasResponseData: !!response.data,
                profilePictureExists: !!response.data?.profilePicture,
                profilePictureValue: response.data?.profilePicture
            });

            if (!response.data?.profilePicture) {
                logger.error('Profile picture not found in response data structure');
                throw new Error('No profile picture URL available');
            }

            const fullName = `${response.data.firstName || ''} ${response.data.lastName || ''}`.trim();
            
            const result = {
                profilePicture: response.data.profilePicture,
                fullName: fullName
            };
            logger.info('Returning profile data:', result);

            return result;

        } catch (error) {
            const errorMessage = this.handleApiError(error, url);
            logger.error(`API request failed: ${errorMessage}`);
            throw new Error(errorMessage);
        }
    }

    async waitForRateLimit() {
        const timeSinceLastRequest = Date.now() - this.lastRequestTime;
        if (timeSinceLastRequest < this.minRequestInterval) {
            await new Promise(resolve => 
                setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
            );
        }
    }

    extractProfileId(url) {
        const username = url.split('/in/')[1]?.replace(/\/$/, '') || url;
        logger.info(`Extracted username: ${username}`);
        return username;
    }

    handleApiError(error, url) {
        logger.error('API Error details:', {
            error: error.message,
            response: error.response?.data,
            status: error.response?.status,
            url: url
        });
        return error.message;
    }

    async validateUrl(url) {
        const linkedinUrlPattern = /^https:\/\/(www\.)?linkedin\.com\/in\/[\w\-_%]+\/?$/;
        return linkedinUrlPattern.test(url);
    }
}

module.exports = new LinkedinService(); 
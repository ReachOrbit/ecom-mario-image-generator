require('dotenv').config();
const axios = require('axios');
const logger = require('../utils/logger');

async function validateDiscordToken() {
    const baseURL = process.env.DISCORD_API_URL.endsWith('/') 
        ? process.env.DISCORD_API_URL 
        : `${process.env.DISCORD_API_URL}/`;

    try {
        const response = await axios.get(`${baseURL}users/@me`, {
            headers: {
                'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        logger.info('Discord token validated successfully');
        return true;
    } catch (error) {
        logger.error('Discord token validation failed:', error.response?.data || error.message);
        throw new Error('Invalid Discord bot token');
    }
}

// Validate required environment variables
const requiredVars = {
    DISCORD_API_URL: process.env.DISCORD_API_URL,
    DISCORD_APPLICATION_ID: process.env.DISCORD_APPLICATION_ID,
    DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
    DISCORD_CHANNEL_ID: process.env.DISCORD_CHANNEL_ID
};

// Check for missing variables
const missingVars = Object.entries(requiredVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

// Export the validation function and required variables
module.exports = { validateDiscordToken, requiredVars }; 
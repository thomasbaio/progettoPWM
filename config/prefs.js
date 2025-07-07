import * as dotenv from 'dotenv';
dotenv.config();

/**
 * Main configs
 * @param {string} host - Host to use as server for NodeJS environment
 * @param {string} port - Port to use for the host if available
 */
/**
 * Configuration object for server settings
 * @type {Object}
 * @property {string} host - The host address from environment variables
 * @property {string} port - The port number from environment variables
 */
const config = {
    host: process.env.HOST,
    port: process.env.PORT,
};

export { config };
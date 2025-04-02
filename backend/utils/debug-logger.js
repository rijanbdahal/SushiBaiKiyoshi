// debug-logger.js
const DEBUG_ENABLED = process.env.DEBUG_ENABLED === 'true' || true;

/**
 * Utility for consistent debug logging across the application
 */
const logger = {
    /**
     * Log a route being called
     * @param {Object} req - Express request object
     * @param {string} routeName - Name of the route module
     */
    routeCalled: (req, routeName) => {
        if (DEBUG_ENABLED) {
            console.log(`[DEBUG][${new Date().toISOString()}][${routeName}] ${req.method} ${req.originalUrl}`);
        }
    },

    /**
     * Log a specific action
     * @param {string} routeName - Name of the route module
     * @param {string} action - Description of the action
     * @param {Object} [data] - Optional data to log
     */
    action: (routeName, action, data = null) => {
        if (DEBUG_ENABLED) {
            if (data) {
                console.log(`[DEBUG][${new Date().toISOString()}][${routeName}] ${action}`, data);
            } else {
                console.log(`[DEBUG][${new Date().toISOString()}][${routeName}] ${action}`);
            }
        }
    },

    /**
     * Log an error
     * @param {string} routeName - Name of the route module
     * @param {string} action - Description of the action that caused the error
     * @param {Error} error - The error object
     */
    error: (routeName, action, error) => {
        if (DEBUG_ENABLED) {
            console.error(`[ERROR][${new Date().toISOString()}][${routeName}] ${action}:`, error);
        }
    }
};

module.exports = logger;
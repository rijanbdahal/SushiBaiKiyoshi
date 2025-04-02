const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const db = require('../dbconnection');
const logger = require('../utils/debug-logger');

const ROUTE_NAME = 'profile';

const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
    logger.error(ROUTE_NAME, 'SECRET_KEY not set in environment variables');
    console.error("SECRET_KEY is not set in environment variables.");
    process.exit(1); // Stop server if SECRET_KEY is missing
}

// Fetch user profile
router.get('/:userId', (req, res) => {
    logger.routeCalled(req, ROUTE_NAME);
    const { userId } = req.params;
    logger.action(ROUTE_NAME, 'Fetching user profile', { userId });

    const query = `
        SELECT u.first_name, u.last_name, u.phone_number, u.email_address, u.user_type,
               a.street_address, a.city, a.province, a.country, a.postal_code
        FROM users u
                 JOIN full_address a ON u.address_id = a.address_id
        WHERE u.user_id = ?;
    `;

    db.execute(query, [userId])
        .then(([result]) => {
            if (result.length === 0) {
                logger.action(ROUTE_NAME, 'User not found', { userId });
                return res.status(404).json({ message: 'User not found.' });
            }
            logger.action(ROUTE_NAME, 'User profile fetched successfully', { userId });
            console.log(result);
            res.json(result[0]);
        })
        .catch(err => {
            logger.error(ROUTE_NAME, 'Error fetching profile', err);
            console.error('Error fetching profile:', err);
            res.status(500).json({ message: 'Error fetching profile.' });
        });
});

// Update user profile
router.put('/', (req, res) => {
    logger.routeCalled(req, ROUTE_NAME);
    const { first_name, last_name, phone_number, email_address, address } = req.body;
    logger.action(ROUTE_NAME, 'Updating user profile', { email_address });

    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logger.action(ROUTE_NAME, 'Missing authorization token');
        return res.status(400).json({ message: 'Authorization token is required.' });
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, SECRET_KEY, async (err, decodedToken) => {
        if (err) {
            logger.error(ROUTE_NAME, 'Invalid or expired token', err);
            return res.status(401).json({ message: 'Invalid or expired token.' });
        }

        const userId = decodedToken.userId;
        logger.action(ROUTE_NAME, 'Token verified, updating profile', { userId });

        try {
            // Update user details
            logger.action(ROUTE_NAME, 'Updating user details', { userId });
            await db.execute(
                `UPDATE users SET first_name = ?, last_name = ?, phone_number = ?, email_address = ? WHERE user_id = ?;`,
                [first_name, last_name, phone_number, email_address, userId]
            );

            if (address) {
                // Get address_id first
                logger.action(ROUTE_NAME, 'Getting address_id', { userId });
                const [addressResult] = await db.execute(
                    `SELECT address_id FROM users WHERE user_id = ?;`, [userId]
                );

                if (addressResult.length > 0) {
                    const addressId = addressResult[0].address_id;
                    logger.action(ROUTE_NAME, 'Updating address', { addressId });
                    await db.execute(
                        `UPDATE full_address SET street_address = ?, city = ?, province = ?, country = ?, postal_code = ? WHERE address_id = ?;`,
                        [address.street_address, address.city, address.province, address.country, address.postal_code, addressId]
                    );
                }
            }
            logger.action(ROUTE_NAME, 'Profile updated successfully', { userId });
            res.json({ message: 'Profile updated successfully.' });

        } catch (error) {
            logger.error(ROUTE_NAME, 'Error updating profile', error);
            console.error('Error updating profile:', error);
            res.status(500).json({ message: 'Error updating profile.' });
        }
    });
});

module.exports = router;
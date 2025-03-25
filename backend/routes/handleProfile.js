
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const db = require('../dbconnection');

const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
    console.error("SECRET_KEY is not set in environment variables.");
    process.exit(1); // Stop server if SECRET_KEY is missing
}

// Fetch user profile
router.get('/:userId', (req, res) => {
    const { userId } = req.params;
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
                return res.status(404).json({ message: 'User not found.' });
            }
            console.log(result);
            res.json(result[0]);
        })
        .catch(err => {
            console.error('Error fetching profile:', err);
            res.status(500).json({ message: 'Error fetching profile.' });
        });
});

// Update user profile
router.put('/', (req, res) => {
    const { first_name, last_name, phone_number, email_address, address } = req.body;

    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(400).json({ message: 'Authorization token is required.' });
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, SECRET_KEY, async (err, decodedToken) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid or expired token.' });
        }

        const userId = decodedToken.userId;
        try {
            // Update user details
            await db.execute(
                `UPDATE users SET first_name = ?, last_name = ?, phone_number = ?, email_address = ? WHERE user_id = ?;`,
                [first_name, last_name, phone_number, email_address, userId]
            );

            if (address) {
                // Get address_id first
                const [addressResult] = await db.execute(
                    `SELECT address_id FROM users WHERE user_id = ?;`, [userId]
                );

                if (addressResult.length > 0) {
                    const addressId = addressResult[0].address_id;
                    await db.execute(
                        `UPDATE full_address SET street_address = ?, city = ?, province = ?, country = ?, postal_code = ? WHERE address_id = ?;`,
                        [address.street_address, address.city, address.province, address.country, address.postal_code, addressId]
                    );
                }
            }
            res.json({ message: 'Profile updated successfully.' });

        } catch (error) {
            console.error('Error updating profile:', error);
            res.status(500).json({ message: 'Error updating profile.' });
        }
    });
});

module.exports = router;

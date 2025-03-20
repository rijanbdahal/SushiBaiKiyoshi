const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const db = require('../dbconnection');

const SECRET_KEY = "egwfdnkln1234nkwenafdb3qih4qwjdsandaf"; // Same secret used to sign the token

// Route to get the user's profile
router.get('/', (req, res) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(400).json({ message: 'Authorization token is required.' });
    }

    // Verify the token and extract userId
    jwt.verify(token, SECRET_KEY, (err, decodedToken) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid or expired token.' });
        }

        const userId = decodedToken.userId;  // Extracted userId from token

        // Query to fetch the user's profile data
        const query = `
            SELECT u.first_name, u.last_name, u.phone_number, u.email_address, u.user_type,
                   a.street_address, a.city, a.province, a.country, a.postal_code
            FROM users u
            JOIN full_address a ON u.address_id = a.address_id
            WHERE u.user_id = ?;
        `;

        db.execute(query, [userId], (err, result) => {
            if (err) {
                console.error('Error fetching profile:', err);
                return res.status(500).json({ message: 'Error fetching profile.' });
            }

            if (result.length === 0) {
                return res.status(404).json({ message: 'User not found.' });
            }

            res.json(result[0]);  // Send the user profile data
        });
    });
});

// Route to update the user's profile
router.put('/', (req, res) => {
    const { first_name, last_name, phone_number, email_address, address } = req.body;
    const token = req.headers['authorization'];  // Get the token from headers

    if (!token) {
        return res.status(400).json({ message: 'Authorization token is required.' });
    }

    // Verify the token and extract userId
    jwt.verify(token, SECRET_KEY, (err, decodedToken) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid or expired token.' });
        }

        const userId = decodedToken.userId;  // Extracted userId from token

        // Update query for user's profile
        const updateUserQuery = `
            UPDATE users
            SET first_name = ?, last_name = ?, phone_number = ?, email_address = ?
            WHERE user_id = ?;
        `;

        db.execute(updateUserQuery, [first_name, last_name, phone_number, email_address, userId], (err) => {
            if (err) {
                console.error('Error updating profile:', err);
                return res.status(500).json({ message: 'Error updating profile.' });
            }

            // If address is provided, update it as well
            if (address) {
                const updateAddressQuery = `
                    UPDATE full_address
                    SET street_address = ?, city = ?, province = ?, country = ?, postal_code = ?
                    WHERE address_id = (SELECT address_id FROM users WHERE user_id = ?);
                `;
                db.execute(updateAddressQuery, [
                    address.street_address, address.city, address.province,
                    address.country, address.postal_code, userId
                ], (err) => {
                    if (err) {
                        console.error('Error updating address:', err);
                        return res.status(500).json({ message: 'Error updating address.' });
                    }

                    res.json({ message: 'Profile updated successfully.' });
                });
            } else {
                res.json({ message: 'Profile updated successfully.' });
            }
        });
    });
});

module.exports = router;

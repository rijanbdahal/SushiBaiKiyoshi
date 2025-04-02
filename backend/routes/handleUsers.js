const express = require('express');
const db = require('../dbconnection');
const router = express.Router();
const logger = require('../utils/debug-logger');

const ROUTE_NAME = 'users';

// Get all users and their user type
router.get('/getUsers', async (req, res) => {
    logger.routeCalled(req, ROUTE_NAME);
    logger.action(ROUTE_NAME, 'Fetching all users');

    try {
        const query = `SELECT u.user_id, u.first_name, u.last_name, u.phone_number, u.email_address, u.user_type, fa.street_address, fa.city, fa.province, fa.country 
                       FROM users u
                       LEFT JOIN full_address fa ON u.address_id = fa.address_id`;
        const [users] = await db.query(query);
        logger.action(ROUTE_NAME, 'Users fetched successfully', { count: users.length });
        res.status(200).json(users);
    } catch (err) {
        logger.error(ROUTE_NAME, 'Error fetching users', err);
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Edit a user's information
router.put('/editUser/:user_id', async (req, res) => {
    logger.routeCalled(req, ROUTE_NAME);
    const { user_id } = req.params;
    const { first_name, last_name, phone_number, email_address, user_type, address_id } = req.body;
    logger.action(ROUTE_NAME, 'Editing user', { user_id, email_address });

    if (!first_name || !last_name || !phone_number || !email_address || !user_type || !address_id) {
        logger.action(ROUTE_NAME, 'User details incomplete', req.body);
        return res.status(400).json({ error: 'User details are incomplete.' });
    }

    try {
        const query = `UPDATE users SET first_name = ?, last_name = ?, phone_number = ?, email_address = ?, user_type = ?, address_id = ? WHERE user_id = ?`;
        const [result] = await db.query(query, [first_name, last_name, phone_number, email_address, user_type, address_id, user_id]);

        if (result.affectedRows === 0) {
            logger.action(ROUTE_NAME, 'User not found', { user_id });
            return res.status(404).json({ error: 'User not found.' });
        }

        logger.action(ROUTE_NAME, 'User updated successfully', { user_id });
        res.status(200).json({ message: 'User updated successfully' });
    } catch (err) {
        logger.error(ROUTE_NAME, 'Error editing user', err);
        console.error('Error editing user:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete a user
router.delete('/deleteUser/:user_id', async (req, res) => {
    logger.routeCalled(req, ROUTE_NAME);
    const { user_id } = req.params;
    logger.action(ROUTE_NAME, 'Deleting user', { user_id });

    try {
        const query = `DELETE FROM users WHERE user_id = ?`;
        const [result] = await db.query(query, [user_id]);

        if (result.affectedRows === 0) {
            logger.action(ROUTE_NAME, 'User not found', { user_id });
            return res.status(404).json({ error: 'User not found.' });
        }

        logger.action(ROUTE_NAME, 'User deleted successfully', { user_id });
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        logger.error(ROUTE_NAME, 'Error deleting user', err);
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
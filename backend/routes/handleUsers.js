const express = require('express');
const db = require('../dbconnection');
const router = express.Router();

// Get all users and their user type
router.get('/getUsers', async (req, res) => {
    try {
        const query = `SELECT u.user_id, u.first_name, u.last_name, u.phone_number, u.email_address, u.user_type, fa.street_address, fa.city, fa.province, fa.country 
                       FROM users u
                       LEFT JOIN full_address fa ON u.address_id = fa.address_id`;
        const [users] = await db.query(query);
        res.status(200).json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Edit a user's information
router.put('/editUser/:user_id', async (req, res) => {
    const { user_id } = req.params;
    const { first_name, last_name, phone_number, email_address, user_type, address_id } = req.body;

    if (!first_name || !last_name || !phone_number || !email_address || !user_type || !address_id) {
        return res.status(400).json({ error: 'User details are incomplete.' });
    }

    try {
        const query = `UPDATE users SET first_name = ?, last_name = ?, phone_number = ?, email_address = ?, user_type = ?, address_id = ? WHERE user_id = ?`;
        const [result] = await db.query(query, [first_name, last_name, phone_number, email_address, user_type, address_id, user_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.status(200).json({ message: 'User updated successfully' });
    } catch (err) {
        console.error('Error editing user:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete a user
router.delete('/deleteUser/:user_id', async (req, res) => {
    const { user_id } = req.params;

    try {
        const query = `DELETE FROM users WHERE user_id = ?`;
        const [result] = await db.query(query, [user_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;

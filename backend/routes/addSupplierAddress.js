const express = require('express');
const router = express.Router();
const db = require('../dbconnection');

// POST: Add new address
router.post('/', (req, res) => {
    const { postal_code, country, province, city, street_address } = req.body;

    const query = `INSERT INTO full_address (postal_code, country, province, city, street_address) VALUES (?, ?, ?, ?, ?)`;
    const values = [postal_code, country, province, city, street_address];

    db.query(query, values, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Address added successfully', addressId: result.insertId });
    });
});

module.exports = router;
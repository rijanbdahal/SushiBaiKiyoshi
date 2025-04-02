const express = require('express');
const router = express.Router();
const db = require('../dbconnection');
const logger = require('../utils/debug-logger');

const ROUTE_NAME = 'supplierAddress';

// POST: Add new address
router.post('/', (req, res) => {
    logger.routeCalled(req, ROUTE_NAME);
    const { postal_code, country, province, city, street_address } = req.body;
    logger.action(ROUTE_NAME, 'Adding new supplier address', { postal_code, city });

    const query = `INSERT INTO full_address (postal_code, country, province, city, street_address) VALUES (?, ?, ?, ?, ?)`;
    const values = [postal_code, country, province, city, street_address];

    db.query(query, values, (err, result) => {
        if (err) {
            logger.error(ROUTE_NAME, 'Error adding supplier address', err);
            return res.status(500).json({ error: err.message });
        }
        logger.action(ROUTE_NAME, 'Supplier address added successfully', { addressId: result.insertId });
        res.status(201).json({ message: 'Address added successfully', addressId: result.insertId });
    });
});

module.exports = router;
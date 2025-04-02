const express = require('express');
const router = express.Router();
const db = require('../dbconnection');
const logger = require('../utils/debug-logger'); // Adjust path as needed

const ROUTE_NAME = 'menuItems'; // This identifies the module in logs

// Route to fetch inventory list
router.get('/inventory', async (req, res) => {
    logger.routeCalled(req, ROUTE_NAME);
    logger.action(ROUTE_NAME, 'Fetching inventory list');

    try {
        const [results] = await db.query('SELECT inventory_id, item_name FROM inventory');
        logger.action(ROUTE_NAME, 'Inventory fetch successful', { count: results.length });
        res.status(200).json(results);
    } catch (err) {
        logger.error(ROUTE_NAME, 'Error fetching inventory', err);
        console.error('Error fetching inventory:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to create a new menu item
router.post('/', async (req, res) => {
    logger.routeCalled(req, ROUTE_NAME);
    const { inventory_id, menu_item_name, description, availability, price } = req.body;
    logger.action(ROUTE_NAME, 'Creating new menu item', { inventory_id, menu_item_name });

    if (!inventory_id || !menu_item_name || price === undefined) {
        logger.action(ROUTE_NAME, 'Missing required fields', req.body);
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const query = `
            INSERT INTO menu_item (inventory_id, menu_item_name, description, availability, price)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [inventory_id, menu_item_name, description || '', availability ?? true, price]);

        logger.action(ROUTE_NAME, 'Menu item created successfully', { menuItemId: result.insertId });
        res.status(201).json({ message: 'Menu item created successfully', menuItemId: result.insertId });
    } catch (err) {
        logger.error(ROUTE_NAME, 'Error creating menu item', err);
        console.error('Error creating menu item:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to fetch all menu items
router.get('/', async (req, res) => {
    logger.routeCalled(req, ROUTE_NAME);
    logger.action(ROUTE_NAME, 'Fetching all menu items');

    try {
        const [results] = await db.query('SELECT * FROM menu_item');
        logger.action(ROUTE_NAME, 'Menu items fetch successful', { count: results.length });
        res.status(200).json(results);
    } catch (err) {
        logger.error(ROUTE_NAME, 'Error fetching menu items', err);
        console.error('Error fetching menu items:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to update a menu item
router.put('/:id', async (req, res) => {
    logger.routeCalled(req, ROUTE_NAME);
    const { id } = req.params;
    const { inventory_id, menu_item_name, description, availability, price } = req.body;
    logger.action(ROUTE_NAME, 'Updating menu item', { id, menu_item_name });

    if (!inventory_id || !menu_item_name || price === undefined) {
        logger.action(ROUTE_NAME, 'Missing required fields', req.body);
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const query = `
            UPDATE menu_item 
            SET inventory_id = ?, menu_item_name = ?, description = ?, availability = ?, price = ?
            WHERE menu_item_id = ?
        `;
        const [result] = await db.query(query, [inventory_id, menu_item_name, description || '', availability ?? true, price, id]);

        if (result.affectedRows === 0) {
            logger.action(ROUTE_NAME, 'Menu item not found', { id });
            return res.status(404).json({ error: 'Menu item not found' });
        }

        logger.action(ROUTE_NAME, 'Menu item updated successfully', { id });
        res.status(200).json({ message: 'Menu item updated successfully' });
    } catch (err) {
        logger.error(ROUTE_NAME, 'Error updating menu item', err);
        console.error('Error updating menu item:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
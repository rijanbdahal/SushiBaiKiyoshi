const express = require('express');
const router = express.Router();
const db = require('../dbconnection');

// Route to fetch inventory list
router.get('/inventory', async (req, res) => {
    try {
        const [results] = await db.query('SELECT inventory_id, item_name FROM inventory');
        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching inventory:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to create a new menu item
router.post('/', async (req, res) => {
    const { inventory_id, menu_item_name, description, availability, price } = req.body;

    if (!inventory_id || !menu_item_name || price === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const query = `
            INSERT INTO menu_item (inventory_id, menu_item_name, description, availability, price)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [inventory_id, menu_item_name, description || '', availability ?? true, price]);

        res.status(201).json({ message: 'Menu item created successfully', menuItemId: result.insertId });
    } catch (err) {
        console.error('Error creating menu item:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to fetch all menu items
router.get('/', async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM menu_item');
        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching menu items:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to update a menu item
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { inventory_id, menu_item_name, description, availability, price } = req.body;

    if (!inventory_id || !menu_item_name || price === undefined) {
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
            return res.status(404).json({ error: 'Menu item not found' });
        }

        res.status(200).json({ message: 'Menu item updated successfully' });
    } catch (err) {
        console.error('Error updating menu item:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;

const express = require("express");
const db = require("../dbconnection"); // Ensure correct DB connection
const logger = require('../utils/debug-logger');

const router = express.Router();
const ROUTE_NAME = 'inventory';

// Get all inventory items
router.get("/", async (req, res) => {
    logger.routeCalled(req, ROUTE_NAME);
    logger.action(ROUTE_NAME, 'Fetching all inventory items');

    try {
        const [items] = await db.query("SELECT * FROM inventory");
        logger.action(ROUTE_NAME, 'Inventory items fetched successfully', { count: items.length });
        res.json(items);
    } catch (error) {
        logger.error(ROUTE_NAME, 'Error fetching inventory', error);
        console.error("Error fetching inventory:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Delete an inventory item
router.delete("/:id", async (req, res) => {
    logger.routeCalled(req, ROUTE_NAME);
    const { id } = req.params;
    logger.action(ROUTE_NAME, 'Deleting inventory item', { id });

    try {
        const [result] = await db.query("DELETE FROM inventory WHERE inventory_id = ?", [id]);
        if (result.affectedRows === 0) {
            logger.action(ROUTE_NAME, 'Item not found', { id });
            return res.status(404).json({ message: "Item not found" });
        }

        logger.action(ROUTE_NAME, 'Item deleted successfully', { id });
        res.json({ message: "Item deleted successfully" });
    } catch (error) {
        logger.error(ROUTE_NAME, 'Error deleting item', error);
        console.error("Error deleting item:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Add a new inventory item
router.post("/", async (req, res) => {
    logger.routeCalled(req, ROUTE_NAME);
    const { item_name, no_in_stock } = req.body;
    logger.action(ROUTE_NAME, 'Adding new inventory item', { item_name, no_in_stock });

    if (!item_name || no_in_stock === undefined) {
        logger.action(ROUTE_NAME, 'Missing required fields', req.body);
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        await db.query("INSERT INTO inventory (item_name, no_in_stock) VALUES (?, ?)", [item_name, no_in_stock]);
        logger.action(ROUTE_NAME, 'Item added successfully', { item_name });
        res.status(201).json({ message: "Item added successfully" });
    } catch (error) {
        logger.error(ROUTE_NAME, 'Error adding item', error);
        console.error("Error adding item:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Edit an existing inventory item
router.put("/:id", async (req, res) => {
    logger.routeCalled(req, ROUTE_NAME);
    const { id } = req.params;
    const { item_name, no_in_stock } = req.body;
    logger.action(ROUTE_NAME, 'Updating inventory item', { id, item_name, no_in_stock });

    try {
        const [result] = await db.query("UPDATE inventory SET item_name = ?, no_in_stock = ? WHERE inventory_id = ?", [item_name, no_in_stock, id]);
        if (result.affectedRows === 0) {
            logger.action(ROUTE_NAME, 'Item not found', { id });
            return res.status(404).json({ message: "Item not found" });
        }

        logger.action(ROUTE_NAME, 'Item updated successfully', { id });
        res.json({ message: "Item updated successfully" });
    } catch (error) {
        logger.error(ROUTE_NAME, 'Error updating item', error);
        console.error("Error updating item:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
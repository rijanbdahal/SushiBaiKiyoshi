const express = require('express');
const router = express.Router();
const db = require('../dbconnection');
const logger = require('../utils/debug-logger');

const ROUTE_NAME = 'receiveFish';

router.get("/getInventory", async (req, res) => {
    logger.routeCalled(req, ROUTE_NAME);
    logger.action(ROUTE_NAME, 'Fetching inventory for receiving fish');

    try {
        const [results] = await db.query("SELECT * FROM inventory");
        logger.action(ROUTE_NAME, 'Inventory fetched successfully', { count: results.length });
        res.json(results);
    } catch (err) {
        logger.error(ROUTE_NAME, 'Error fetching inventory', err);
        console.error("Error fetching inventory:", err);
        res.status(500).json({ error: "Database error" });
    }
});

router.get("/getPostalCode", async (req, res) => {
    logger.routeCalled(req, ROUTE_NAME);
    logger.action(ROUTE_NAME, 'Fetching fish market postal codes');

    try {
        const [results] = await db.query("SELECT * FROM fish_market");
        logger.action(ROUTE_NAME, 'Fish market data fetched successfully', { count: results.length });
        res.json(results);
    } catch (err) {
        logger.error(ROUTE_NAME, 'Error fetching fish market data', err);
        console.error("Error fetching inventory:", err);
        res.status(500).json({ error: "Database error" });
    }
});

// Receive fish and update inventory
router.post("/", async (req, res) => {
    logger.routeCalled(req, ROUTE_NAME);
    const { item_name, quantity, market_name, fish_price, postal_code } = req.body;
    logger.action(ROUTE_NAME, 'Receiving fish shipment', {
        item_name,
        quantity,
        market_name,
        postal_code
    });

    if (!item_name || !quantity || !market_name || !fish_price || !postal_code) {
        logger.action(ROUTE_NAME, 'Missing required fields', req.body);
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        // Check if the fish already exists in inventory
        logger.action(ROUTE_NAME, 'Checking if fish exists in inventory', { item_name });
        const [results] = await db.query("SELECT * FROM inventory WHERE item_name = ?", [item_name]);
        let inventoryId;

        if (results.length > 0) {

            inventoryId = results[0].inventory_id;
            logger.action(ROUTE_NAME, 'Fish exists in inventory, updating stock', {
                inventoryId,
                current_stock: results[0].no_in_stock,
                adding: quantity
            });

            await db.query(
                "UPDATE inventory SET no_in_stock = no_in_stock + ? WHERE item_name = ?",
                [quantity, item_name]
            );
        } else {

            logger.action(ROUTE_NAME, 'Fish not in inventory, adding new item', { item_name, quantity });
            const [insertResult] = await db.query(
                "INSERT INTO inventory (item_name, no_in_stock) VALUES (?, ?)",
                [item_name, quantity]
            );
            inventoryId = insertResult.insertId;
            logger.action(ROUTE_NAME, 'New inventory item created', { inventoryId });
        }

        // Record the market transaction
        logger.action(ROUTE_NAME, 'Recording market transaction', {
            inventoryId,
            market_name,
            fish_price
        });

        await db.query(
            "INSERT INTO fish_market (inventory_id, market_name, fish_price, postal_code, inbound_quantity) VALUES (?, ?, ?, ?, ?)",
            [inventoryId, market_name, fish_price, postal_code, quantity]
        );

        logger.action(ROUTE_NAME, 'Fish received and inventory updated successfully');
        res.json({ message: "Inventory and market details updated" });
    } catch (err) {
        logger.error(ROUTE_NAME, 'Error processing inventory update', err);
        console.error("Error processing inventory update:", err);
        res.status(500).json({ error: "Database error" });
    }
});

router.get("/getReceivedFish", async (req, res) => {
    logger.routeCalled(req, ROUTE_NAME);
    logger.action(ROUTE_NAME, 'Fetching received fish entries');

    try {
        const [results] = await db.query(`
            SELECT fm.market_id, i.item_name, fm.market_name, fm.fish_price, fm.postal_code, fm.inbound_quantity
            FROM fish_market fm
            JOIN inventory i ON fm.inventory_id = i.inventory_id
        `);
        logger.action(ROUTE_NAME, 'Received fish entries fetched successfully', { count: results.length });
        res.json(results);
    } catch (err) {
        logger.error(ROUTE_NAME, 'Error fetching received fish entries', err);
        console.error("Error fetching received fish entries:", err);
        res.status(500).json({ error: "Database error" });
    }
});

module.exports = router;
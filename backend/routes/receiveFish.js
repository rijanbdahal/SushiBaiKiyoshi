const express = require('express');
const router = express.Router();
const db = require('../dbconnection');

router.get("/getInventory", async (req, res) => {
    try {
        const [results] = await db.query("SELECT * FROM inventory");
        res.json(results);
    } catch (err) {
        console.error("Error fetching inventory:", err);
        res.status(500).json({ error: "Database error" });
    }
});

// Receive fish and update inventory
router.post("/", async (req, res) => {
    const { item_name, quantity, market_name, fish_price, postal_code } = req.body;
    if (!item_name || !quantity || !market_name || !fish_price || !postal_code) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const [results] = await db.query("SELECT * FROM inventory WHERE item_name = ?", [item_name]);
        let inventoryId;

        if (results.length > 0) {
            // Fish exists, update stock
            inventoryId = results[0].inventory_id;
            await db.query(
                "UPDATE inventory SET no_in_stock = no_in_stock + ? WHERE item_name = ?",
                [quantity, item_name]
            );
        } else {
            // Fish does not exist, insert new record
            const [insertResult] = await db.query(
                "INSERT INTO inventory (item_name, no_in_stock) VALUES (?, ?)",
                [item_name, quantity]
            );
            inventoryId = insertResult.insertId;
        }

        await db.query(
            "INSERT INTO fish_market (inventory_id, market_name, fish_price, postal_code,inbound_quantity) VALUES (?, ?, ?, ?,?)",
            [inventoryId, market_name, fish_price, postal_code,quantity]
        );

        res.json({ message: "Inventory and market details updated" });
    } catch (err) {
        console.error("Error processing inventory update:", err);
        res.status(500).json({ error: "Database error" });
    }
});

router.get("/getReceivedFish", async (req, res) => {
    try {
        const [results] = await db.query(`
            SELECT fm.market_id, i.item_name, fm.market_name, fm.fish_price, fm.postal_code, fm.inbound_quantity
            FROM fish_market fm
            JOIN inventory i ON fm.inventory_id = i.inventory_id
        `);
        res.json(results);
    } catch (err) {
        console.error("Error fetching received fish entries:", err);
        res.status(500).json({ error: "Database error" });
    }
});


module.exports = router;

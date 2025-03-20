const express = require("express");
const db = require("../dbconnection"); // Ensure correct DB connection

const router = express.Router();

// Get all inventory items
router.get("/", async (req, res) => {
    try {
        const [items] = await db.query("SELECT * FROM inventory");
        res.json(items);
    } catch (error) {
        console.error("Error fetching inventory:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
// Delete an inventory item
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.query("DELETE FROM inventory WHERE inventory_id = ?", [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Item not found" });

        res.json({ message: "Item deleted successfully" });
    } catch (error) {
        console.error("Error deleting item:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Add a new inventory item
router.post("/", async (req, res) => {
    const { item_name, no_in_stock } = req.body;
    if (!item_name || no_in_stock === undefined) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        await db.query("INSERT INTO inventory (item_name, no_in_stock) VALUES (?, ?)", [item_name, no_in_stock]);
        res.status(201).json({ message: "Item added successfully" });
    } catch (error) {
        console.error("Error adding item:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Edit an existing inventory item
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { item_name, no_in_stock } = req.body;

    try {
        const [result] = await db.query("UPDATE inventory SET item_name = ?, no_in_stock = ? WHERE inventory_id = ?", [item_name, no_in_stock, id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Item not found" });

        res.json({ message: "Item updated successfully" });
    } catch (error) {
        console.error("Error updating item:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;

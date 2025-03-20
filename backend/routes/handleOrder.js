const express = require('express');
const db = require('../dbconnection');
const router = express.Router();

router.post('/', async (req, res) => {
    const { user_id, order_date, items, status } = req.body;

    if (!user_id || !order_date || !items || items.length === 0 || items.some(item => item.quantity <= 0)) {
        return res.status(400).json({ error: 'Invalid order data: Ensure all fields are provided and quantities are greater than zero.' });
    }

    try {
        // Fetch customer_id based on user_id
        const [customerResult] = await db.query(
            `SELECT customer_id FROM customers WHERE user_id = ?`,
            [user_id]
        );

        if (!customerResult.length) {
            return res.status(400).json({ error: 'Customer not found for the given user.' });
        }

        const customer_id = customerResult[0].customer_id;

        // Calculate total
        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // Insert order
        const orderQuery = `INSERT INTO orders (customer_id, order_date, status, total) VALUES (?, ?, ?, ?)`;
        const [orderResult] = await db.query(orderQuery, [customer_id, order_date, status, total]);
        const order_id = orderResult.insertId;

        // Insert order details
        const orderDetailsPromises = items.map(item => {
            return db.query(
                `INSERT INTO order_details (order_id, menu_item_id, quantity, customization_request) VALUES (?, ?, ?, ?)`,
                [order_id, item.menu_item_id, item.quantity, item.customization_request || null]
            );
        });

        // Update inventory
        const updateInventoryPromises = items.map(item => {
            return db.query(
                `UPDATE inventory SET no_in_stock = no_in_stock - ? WHERE inventory_id = (SELECT inventory_id FROM menu_item WHERE menu_item_id = ?)`,
                [item.quantity, item.menu_item_id]
            );
        });

        // Wait for all promises to complete
        await Promise.all([...orderDetailsPromises, ...updateInventoryPromises]);

        res.status(201).json({ message: 'Order placed successfully', orderId: order_id, total });
    } catch (err) {
        console.error('Error placing order:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Fetch orders for a customer
router.get('/getItems/:user_id', async (req, res) => {
    const { user_id } = req.params;

    try {
        // Fetch customer_id based on user_id
        const [customerResult] = await db.query(
            `SELECT customer_id FROM customers WHERE user_id = ?`,
            [user_id]
        );

        if (!customerResult.length) {
            return res.status(400).json({ error: 'Customer not found for the given user.' });
        }

        const customer_id = customerResult[0].customer_id;

        // Fetch orders for the customer
        const [orders] = await db.query(
            `SELECT * FROM orders WHERE customer_id = ? ORDER BY order_date DESC`,
            [customer_id]
        );

        res.status(200).json(orders);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Fetch all orders (Admin access or for a specific user)
router.get('/getAllOrders', async (req, res) => {
    try {
        const [orders] = await db.query(`SELECT * FROM orders ORDER BY order_date DESC`);
        res.status(200).json(orders);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete an order by order_id
router.delete('/deleteOrder/:order_id', async (req, res) => {
    const { order_id } = req.params;

    try {
        // Delete related order details first
        await db.query('DELETE FROM order_details WHERE order_id = ?', [order_id]);

        // Then delete the order itself
        await db.query('DELETE FROM orders WHERE order_id = ?', [order_id]);

        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (err) {
        console.error('Error deleting order:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;

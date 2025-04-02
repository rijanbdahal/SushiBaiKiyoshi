const express = require('express');
const db = require('../dbconnection');
const axios = require('axios');
const router = express.Router();
const logger = require('../utils/debug-logger');

const ROUTE_NAME = 'orders';

router.post('/', async (req, res) => {
    logger.routeCalled(req, ROUTE_NAME);
    const { user_id, order_date, items, status } = req.body;
    logger.action(ROUTE_NAME, 'Creating new order', { user_id, items_count: items?.length });

    if (!user_id || !order_date || !items || items.length === 0 || items.some(item => item.quantity <= 0)) {
        logger.action(ROUTE_NAME, 'Invalid order data', req.body);
        return res.status(400).json({ error: 'Invalid order data: Ensure all fields are provided and quantities are greater than zero.' });
    }

    try {
        // Fetch customer_id based on user_id
        logger.action(ROUTE_NAME, 'Fetching customer_id for user', { user_id });
        const [customerResult] = await db.query(
            `SELECT customer_id FROM customers WHERE user_id = ?`,
            [user_id]
        );

        if (!customerResult.length) {
            logger.action(ROUTE_NAME, 'Customer not found', { user_id });
            return res.status(400).json({ error: 'Customer not found for the given user.' });
        }

        const customer_id = customerResult[0].customer_id;
        logger.action(ROUTE_NAME, 'Found customer', { customer_id });

        // Get discount eligibility for customer items
        logger.action(ROUTE_NAME, 'Checking discounts for items');
        const discountPromises = items.map(async (item) => {
            const [discountResult] = await db.query(
                `SELECT discount_eligible FROM customer_preferences 
                 WHERE customer_id = ? AND menu_item_id = ?`,
                [customer_id, item.menu_item_id]
            );

            return {
                ...item,
                discount_eligible: discountResult.length > 0 ? discountResult[0].discount_eligible : 0,
                original_price: item.price,
                price: discountResult.length > 0 && discountResult[0].discount_eligible ?
                    item.price * 0.9 : // 10% discount
                    item.price
            };
        });

        const itemsWithDiscounts = await Promise.all(discountPromises);
        logger.action(ROUTE_NAME, 'Discount check complete', {
            itemsWithDiscounts: itemsWithDiscounts.map(i => ({
                id: i.menu_item_id,
                discount: i.discount_eligible
            }))
        });

        // Calculate total with discounts applied
        const total = itemsWithDiscounts.reduce((sum, item) => sum + item.price * item.quantity, 0);
        logger.action(ROUTE_NAME, 'Calculated order total', { total });

        // Insert order
        logger.action(ROUTE_NAME, 'Inserting order');
        const orderQuery = `INSERT INTO orders (customer_id, order_date, status, total) VALUES (?, ?, ?, ?)`;
        const [orderResult] = await db.query(orderQuery, [customer_id, order_date, status, total]);
        const order_id = orderResult.insertId;
        logger.action(ROUTE_NAME, 'Order inserted', { order_id });

        // Insert order details
        logger.action(ROUTE_NAME, 'Processing order details');
        const orderDetailsPromises = items.map(item => {
            logger.action(ROUTE_NAME, 'Adding item to order', {
                order_id,
                menu_item_id: item.menu_item_id,
                quantity: item.quantity
            });
            return db.query(
                `INSERT INTO order_details (order_id, menu_item_id, quantity, customization_request) VALUES (?, ?, ?, ?)`,
                [order_id, item.menu_item_id, item.quantity, item.customization_request || null]
            );
        });

        // Update inventory
        logger.action(ROUTE_NAME, 'Updating inventory');
        const updateInventoryPromises = items.map(item => {
            logger.action(ROUTE_NAME, 'Reducing inventory for item', {
                menu_item_id: item.menu_item_id,
                quantity: item.quantity
            });
            return db.query(
                `UPDATE inventory SET no_in_stock = no_in_stock - ? WHERE inventory_id = (SELECT inventory_id FROM menu_item WHERE menu_item_id = ?)`,
                [item.quantity, item.menu_item_id]
            );
        });

        // Update customer preferences for discounts
        logger.action(ROUTE_NAME, 'Updating customer preferences');
        const updatePreferencesPromises = items.map(item => {
            try {
                logger.action(ROUTE_NAME, 'Updating preferences for item', {
                    customer_id,
                    menu_item_id: item.menu_item_id
                });
                return axios.post('http://localhost:5000/analytics/update-preferences', {
                    customer_id: customer_id,
                    menu_item_id: item.menu_item_id,
                    quantity: item.quantity
                });
            } catch (error) {
                logger.error(ROUTE_NAME, 'Error updating customer preferences', error);
                // Continue even if this fails
                return Promise.resolve();
            }
        });

        // Wait for all promises to complete
        logger.action(ROUTE_NAME, 'Waiting for all operations to complete');
        await Promise.all([...orderDetailsPromises, ...updateInventoryPromises, ...updatePreferencesPromises]);

        logger.action(ROUTE_NAME, 'Order processed successfully', { order_id, total });
        res.status(201).json({ message: 'Order placed successfully', orderId: order_id, total });
    } catch (err) {
        logger.error(ROUTE_NAME, 'Error placing order', err);
        console.error('Error placing order:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Fetch orders for a customer
router.get('/getItems/:user_id', async (req, res) => {
    logger.routeCalled(req, ROUTE_NAME);
    const { user_id } = req.params;
    logger.action(ROUTE_NAME, 'Fetching orders for user', { user_id });

    try {
        // Fetch customer_id based on user_id
        logger.action(ROUTE_NAME, 'Getting customer_id for user', { user_id });
        const [customerResult] = await db.query(
            `SELECT customer_id FROM customers WHERE user_id = ?`,
            [user_id]
        );

        if (!customerResult.length) {
            logger.action(ROUTE_NAME, 'Customer not found', { user_id });
            return res.status(400).json({ error: 'Customer not found for the given user.' });
        }

        const customer_id = customerResult[0].customer_id;
        logger.action(ROUTE_NAME, 'Found customer', { customer_id });

        // Fetch orders for the customer
        logger.action(ROUTE_NAME, 'Fetching orders for customer', { customer_id });
        const [orders] = await db.query(
            `SELECT * FROM orders WHERE customer_id = ? ORDER BY order_date DESC`,
            [customer_id]
        );

        logger.action(ROUTE_NAME, 'Orders fetched successfully', { count: orders.length });
        res.status(200).json(orders);
    } catch (err) {
        logger.error(ROUTE_NAME, 'Error fetching orders', err);
        console.error('Error fetching orders:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Fetch all orders (Admin access or for a specific user)
router.get('/getAllOrders', async (req, res) => {
    logger.routeCalled(req, ROUTE_NAME);
    logger.action(ROUTE_NAME, 'Fetching all orders');

    try {
        const [orders] = await db.query(`SELECT * FROM orders ORDER BY order_date DESC`);
        logger.action(ROUTE_NAME, 'All orders fetched successfully', { count: orders.length });
        res.status(200).json(orders);
    } catch (err) {
        logger.error(ROUTE_NAME, 'Error fetching all orders', err);
        console.error('Error fetching orders:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/completeOrder/:orderId', async (req, res) => {
    logger.routeCalled(req, ROUTE_NAME);
    const {orderId} = req.params;
    const status = "Completed";
    logger.action(ROUTE_NAME, 'Marking order as completed', { orderId });

    try{
        await db.query('UPDATE orders SET status = ? WHERE order_id = ?', [status, orderId]);
        logger.action(ROUTE_NAME, 'Order marked as completed successfully', { orderId });
        res.status(200).json({ message: 'Order marked as completed successfully' });
    } catch (error){
        logger.error(ROUTE_NAME, 'Order completion error', error);
        console.error(error);
        res.status(500).json({ error: 'Order Completion Error' });
    }
});

router.put('/processOrder/:orderId', async (req, res) => {
    logger.routeCalled(req, ROUTE_NAME);
    const {orderId} = req.params;
    const status = "Processing";
    logger.action(ROUTE_NAME, 'Marking order as processing', { orderId });

    try{
        await db.query('UPDATE orders SET status = ? WHERE order_id = ?', [status, orderId]);
        logger.action(ROUTE_NAME, 'Order marked as processing successfully', { orderId });
        res.status(200).json({ message: 'Order marked as processing successfully' });
    } catch (error){
        logger.error(ROUTE_NAME, 'Order processing error', error);
        console.error(error);
        res.status(500).json({ error: 'Order Processing Error' });
    }
});

router.delete('/deleteOrder/:order_id', async (req, res) => {
    logger.routeCalled(req, ROUTE_NAME);
    const { order_id } = req.params;
    logger.action(ROUTE_NAME, 'Deleting order', { order_id });

    try {
        // Delete related order details first
        logger.action(ROUTE_NAME, 'Deleting related order details', { order_id });
        await db.query('DELETE FROM order_details WHERE order_id = ?', [order_id]);

        logger.action(ROUTE_NAME, 'Deleting order record', { order_id });
        await db.query('DELETE FROM orders WHERE order_id = ?', [order_id]);

        logger.action(ROUTE_NAME, 'Order deleted successfully', { order_id });
        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (err) {
        logger.error(ROUTE_NAME, 'Error deleting order', err);
        console.error('Error deleting order:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get available discounts for a user
router.get('/discounts/:user_id', async (req, res) => {
    logger.routeCalled(req, ROUTE_NAME);
    const { user_id } = req.params;
    logger.action(ROUTE_NAME, 'Fetching available discounts for user', { user_id });

    try {
        // Get customer_id from user_id
        logger.action(ROUTE_NAME, 'Getting customer_id for user', { user_id });
        const [customerResult] = await db.query(
            `SELECT customer_id FROM customers WHERE user_id = ?`,
            [user_id]
        );

        if (!customerResult.length) {
            logger.action(ROUTE_NAME, 'Customer not found', { user_id });
            return res.status(404).json({ error: 'Customer not found' });
        }

        const customer_id = customerResult[0].customer_id;
        logger.action(ROUTE_NAME, 'Found customer', { customer_id });

        // Get customer preferences with discount eligibility
        logger.action(ROUTE_NAME, 'Fetching discount eligibility', { customer_id });
        const [discounts] = await db.query(`
            SELECT 
                cp.menu_item_id,
                mi.menu_item_name,
                mi.price as original_price,
                ROUND(mi.price * 0.9, 2) as discounted_price,
                cp.order_count,
                cp.discount_eligible
            FROM customer_preferences cp
            JOIN menu_item mi ON cp.menu_item_id = mi.menu_item_id
            WHERE cp.customer_id = ?
            ORDER BY cp.discount_eligible DESC, cp.order_count DESC
        `, [customer_id]);

        logger.action(ROUTE_NAME, 'Discounts fetched successfully', { count: discounts.length });
        res.status(200).json(discounts);
    } catch (err) {
        logger.error(ROUTE_NAME, 'Error fetching discounts', err);
        console.error('Error fetching discounts:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
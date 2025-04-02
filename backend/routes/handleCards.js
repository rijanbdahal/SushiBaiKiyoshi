const express = require('express');
const db = require('../dbconnection');
const router = express.Router();
const logger = require('../utils/debug-logger');

const ROUTE_NAME = 'cards';

// Add a new card
router.post('/addCard', async (req, res) => {
    logger.routeCalled(req, ROUTE_NAME);
    const { card_number, card_holder_name, postal_code } = req.body;
    logger.action(ROUTE_NAME, 'Adding new card', { card_holder_name, postal_code });

    if (!card_number || !card_holder_name || !postal_code) {
        logger.action(ROUTE_NAME, 'Card details incomplete', req.body);
        return res.status(400).json({ error: 'Card details are incomplete.' });
    }

    try {
        const query = `INSERT INTO cards (card_number, card_holder_name, postal_code) VALUES (?, ?, ?)`;
        const [result] = await db.query(query, [card_number, card_holder_name, postal_code]);
        logger.action(ROUTE_NAME, 'Card added successfully', { cardId: result.insertId });
        res.status(201).json({ message: 'Card added successfully', cardId: result.insertId });
    } catch (err) {
        logger.error(ROUTE_NAME, 'Error adding card', err);
        console.error('Error adding card:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update a card's details
router.put('/editCard/:payment_type_id', async (req, res) => {
    logger.routeCalled(req, ROUTE_NAME);
    const { payment_type_id } = req.params;
    const { card_number, card_holder_name, postal_code } = req.body;
    logger.action(ROUTE_NAME, 'Updating card', { payment_type_id, card_holder_name });

    if (!card_number || !card_holder_name || !postal_code) {
        logger.action(ROUTE_NAME, 'Card details incomplete', req.body);
        return res.status(400).json({ error: 'Card details are incomplete.' });
    }

    try {
        const query = `UPDATE cards SET card_number = ?, card_holder_name = ?, postal_code = ? WHERE payment_type_id = ?`;
        const [result] = await db.query(query, [card_number, card_holder_name, postal_code, payment_type_id]);

        if (result.affectedRows === 0) {
            logger.action(ROUTE_NAME, 'Card not found', { payment_type_id });
            return res.status(404).json({ error: 'Card not found.' });
        }

        logger.action(ROUTE_NAME, 'Card updated successfully', { payment_type_id });
        res.status(200).json({ message: 'Card updated successfully' });
    } catch (err) {
        logger.error(ROUTE_NAME, 'Error updating card', err);
        console.error('Error updating card:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete a card
router.delete('/deleteCard/:payment_type_id', async (req, res) => {
    logger.routeCalled(req, ROUTE_NAME);
    const { payment_type_id } = req.params;
    logger.action(ROUTE_NAME, 'Deleting card', { payment_type_id });

    try {
        const query = `DELETE FROM cards WHERE payment_type_id = ?`;
        const [result] = await db.query(query, [payment_type_id]);

        if (result.affectedRows === 0) {
            logger.action(ROUTE_NAME, 'Card not found', { payment_type_id });
            return res.status(404).json({ error: 'Card not found.' });
        }

        logger.action(ROUTE_NAME, 'Card deleted successfully', { payment_type_id });
        res.status(200).json({ message: 'Card deleted successfully' });
    } catch (err) {
        logger.error(ROUTE_NAME, 'Error deleting card', err);
        console.error('Error deleting card:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/getCards/:userName', async (req, res) => {
    logger.routeCalled(req, ROUTE_NAME);
    try {
        const {userName} = req.params;
        logger.action(ROUTE_NAME, 'Fetching cards for user', { userName });
        console.log(userName);
        const [cards] = await db.query(`SELECT * FROM cards where card_holder_name = ?`, [userName]);
        logger.action(ROUTE_NAME, 'Cards retrieved successfully', { count: cards.length });
        res.status(200).json(cards);
    } catch (err) {
        logger.error(ROUTE_NAME, 'Error fetching cards', err);
        console.error('Error fetching cards:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
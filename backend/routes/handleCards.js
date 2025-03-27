const express = require('express');
const db = require('../dbconnection');
const router = express.Router();

// Add a new card
router.post('/addCard', async (req, res) => {
    const { card_number, card_holder_name, postal_code } = req.body;

    if (!card_number || !card_holder_name || !postal_code) {
        return res.status(400).json({ error: 'Card details are incomplete.' });
    }

    try {
        const query = `INSERT INTO cards (card_number, card_holder_name, postal_code) VALUES (?, ?, ?)`;
        const [result] = await db.query(query, [card_number, card_holder_name, postal_code]);
        res.status(201).json({ message: 'Card added successfully', cardId: result.insertId });
    } catch (err) {
        console.error('Error adding card:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update a card's details
router.put('/editCard/:payment_type_id', async (req, res) => {
    const { payment_type_id } = req.params;
    const { card_number, card_holder_name, postal_code } = req.body;

    if (!card_number || !card_holder_name || !postal_code) {
        return res.status(400).json({ error: 'Card details are incomplete.' });
    }

    try {
        const query = `UPDATE cards SET card_number = ?, card_holder_name = ?, postal_code = ? WHERE payment_type_id = ?`;
        const [result] = await db.query(query, [card_number, card_holder_name, postal_code, payment_type_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Card not found.' });
        }

        res.status(200).json({ message: 'Card updated successfully' });
    } catch (err) {
        console.error('Error updating card:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete a card
router.delete('/deleteCard/:payment_type_id', async (req, res) => {
    const { payment_type_id } = req.params;

    try {
        const query = `DELETE FROM cards WHERE payment_type_id = ?`;
        const [result] = await db.query(query, [payment_type_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Card not found.' });
        }

        res.status(200).json({ message: 'Card deleted successfully' });
    } catch (err) {
        console.error('Error deleting card:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/getCards/:userName', async (req, res) => {
    try {
        const {userName} = req.params;
        console.log(userName);
        const [cards] = await db.query(`SELECT * FROM cards where card_holder_name = ?`, [userName]);
        res.status(200).json(cards);
    } catch (err) {
        console.error('Error fetching cards:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
module.exports = router;

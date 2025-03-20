import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../../css/css.css"
import Header from "../includes/header";

const ManageCardsPage = () => {
    const [cards, setCards] = useState([]);
    const [newCard, setNewCard] = useState({
        card_number: '',
        card_holder_name: '',
        postal_code: ''
    });
    const [editCard, setEditCard] = useState({
        payment_type_id: null,
        card_number: '',
        card_holder_name: '',
        postal_code: ''
    });
    const [loading, setLoading] = useState(false);

    // Fetch all cards
    useEffect(() => {
        const fetchCards = async () => {
            setLoading(true);
            try {
                const response = await axios.get('http://localhost:5000/cards/getCards');
                setCards(response.data);
            } catch (error) {
                console.error('Error fetching cards:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCards();
    }, []);

    // Handle add card
    const handleAddCard = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/cards/addCard', newCard);
            alert(response.data.message);
            setCards([...cards, { ...newCard, payment_type_id: response.data.cardId }]);
            setNewCard({ card_number: '', card_holder_name: '', postal_code: '' });
        } catch (error) {
            console.error('Error adding card:', error);
            alert('Failed to add card.');
        } finally {
            setLoading(false);
        }
    };

    // Handle edit card
    const handleEditCard = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.put(`http://localhost:5000/cards/editCard/${editCard.payment_type_id}`, editCard);
            alert(response.data.message);
            setCards(cards.map(card => (card.payment_type_id === editCard.payment_type_id ? editCard : card)));
            setEditCard({ payment_type_id: null, card_number: '', card_holder_name: '', postal_code: '' });
        } catch (error) {
            console.error('Error editing card:', error);
            alert('Failed to edit card.');
        } finally {
            setLoading(false);
        }
    };

    // Handle delete card
    const handleDeleteCard = async (payment_type_id) => {
        if (window.confirm('Are you sure you want to delete this card?')) {
            setLoading(true);

            try {
                const response = await axios.delete(`http://localhost:5000/cards/deleteCard/${payment_type_id}`);
                alert(response.data.message);
                setCards(cards.filter(card => card.payment_type_id !== payment_type_id));
            } catch (error) {
                console.error('Error deleting card:', error);
                alert('Failed to delete card.');
            } finally {
                setLoading(false);
            }
        }
    };

    return (

        <div className="manage-cards-container">
            <Header />
            <h1 className="page-title">Manage Cards</h1>

            <div className="form-container">
                <h2 className="form-title">Add New Card</h2>
                <form onSubmit={handleAddCard} className="card-form">
                    <input
                        type="text"
                        placeholder="Card Number"
                        value={newCard.card_number}
                        onChange={(e) => setNewCard({ ...newCard, card_number: e.target.value })}
                        required
                        className="form-input"
                    />
                    <input
                        type="text"
                        placeholder="Card Holder Name"
                        value={newCard.card_holder_name}
                        onChange={(e) => setNewCard({ ...newCard, card_holder_name: e.target.value })}
                        required
                        className="form-input"
                    />
                    <input
                        type="text"
                        placeholder="Postal Code"
                        value={newCard.postal_code}
                        onChange={(e) => setNewCard({ ...newCard, postal_code: e.target.value })}
                        required
                        className="form-input"
                    />
                    <button type="submit" disabled={loading} className="form-button">
                        {loading ? 'Adding...' : 'Add Card'}
                    </button>
                </form>
            </div>

            <div className="form-container">
                <h2 className="form-title">Edit Card</h2>
                <form onSubmit={handleEditCard} className="card-form">
                    <select
                        onChange={(e) => {
                            const card = cards.find(card => card.payment_type_id === parseInt(e.target.value));
                            setEditCard(card || { payment_type_id: null, card_number: '', card_holder_name: '', postal_code: '' });
                        }}
                        value={editCard.payment_type_id || ''}
                        className="form-select"
                    >
                        <option value="">Select Card to Edit</option>
                        {cards.map((card) => (
                            <option key={card.payment_type_id} value={card.payment_type_id}>
                                {card.card_holder_name} - {card.card_number}
                            </option>
                        ))}
                    </select>

                    {editCard.payment_type_id && (
                        <>
                            <input
                                type="text"
                                placeholder="Card Number"
                                value={editCard.card_number}
                                onChange={(e) => setEditCard({ ...editCard, card_number: e.target.value })}
                                required
                                className="form-input"
                            />
                            <input
                                type="text"
                                placeholder="Card Holder Name"
                                value={editCard.card_holder_name}
                                onChange={(e) => setEditCard({ ...editCard, card_holder_name: e.target.value })}
                                required
                                className="form-input"
                            />
                            <input
                                type="text"
                                placeholder="Postal Code"
                                value={editCard.postal_code}
                                onChange={(e) => setEditCard({ ...editCard, postal_code: e.target.value })}
                                required
                                className="form-input"
                            />
                            <button type="submit" disabled={loading} className="form-button">
                                {loading ? 'Editing...' : 'Edit Card'}
                            </button>
                        </>
                    )}
                </form>
            </div>

            <div className="card-list">
                <h2 className="form-title">Existing Cards</h2>
                <ul className="card-ul">
                    {cards.map((card) => (
                        <li key={card.payment_type_id} className="card-item">
                            {card.card_holder_name} - {card.card_number} - {card.postal_code}
                            <button onClick={() => handleDeleteCard(card.payment_type_id)} disabled={loading} className="delete-button">
                                {loading ? 'Deleting...' : 'Delete'}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ManageCardsPage;

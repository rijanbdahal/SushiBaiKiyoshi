import React, {useState, useEffect, useContext} from 'react';
import axios from 'axios';
import "../../css/css.css"
import Header from "../includes/header";
import {AuthContext} from "../../AuthProvider";
import { useNavigate } from 'react-router-dom';

const ManageCardsPage = () => {
    const [cards, setCards] = useState([]);
    const { token, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);
    const [userName, setUserName] = useState("");
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
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        // Check if user is admin
        if (user?.user_type === 'A') {
            setIsAdmin(true);
        } else {
            setIsAdmin(false);
            setUserName(user?.first_name + " " + user?.last_name);
        }
    }, [user, token, navigate]);

    const fetchCards = async () => {
        setLoading(true);
        setError(null);
        try {
            let response;
            console.log("Fetching cards, isAdmin:", isAdmin);

            if (isAdmin) {
                // Admins see all cards
                console.log("Fetching all cards for admin");
                response = await axios.get('http://localhost:5000/cards/getAllCards', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                console.log("Admin cards response:", response.data);
            } else {
                // Regular users only see their own cards
                if (userName) {
                    console.log("Fetching cards for user:", userName);
                    response = await axios.get(`http://localhost:5000/cards/getCards/${userName}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    console.log("User cards response:", response.data);
                } else {
                    console.log("Username not set yet, skipping fetch");
                    setLoading(false);
                    return; // Wait until userName is set
                }
            }

            if (response && response.data) {
                // Ensure each card has a payment_type_id property
                const processedCards = Array.isArray(response.data) ? response.data.map(card => {
                    // Use whatever ID field exists in the response, or generate a temp one if needed
                    const id = card.payment_type_id || card.id || card.card_id;
                    return {
                        ...card,
                        payment_type_id: id || Math.floor(Math.random() * 10000) // Fallback to random ID if none exists
                    };
                }) : [];

                setCards(processedCards);

                if (processedCards.length === 0) {
                    console.log("No cards found for the current user/admin");
                } else {
                    console.log(`Found ${processedCards.length} cards`);
                }
            } else {
                console.error("No data in response");
                setCards([]);
            }
        } catch (error) {
            console.error('Error fetching cards:', error.response || error);
            setCards([]);
            setError(`Failed to fetch cards: ${error.response?.data?.error || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if ((isAdmin || userName) && token) {
            fetchCards();
        }
    }, [userName, isAdmin, token]);

    // Handle add card
    const handleAddCard = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Add the user's name to the card information
            const cardData = {
                ...newCard,
                card_holder_name: userName || newCard.card_holder_name
            };

            const response = await axios.post('http://localhost:5000/cards/addCard', cardData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            alert(response.data.message || "Card added successfully");

            // Refresh the card list
            fetchCards();

            // Reset the form
            setNewCard({ card_number: '', card_holder_name: '', postal_code: '' });
        } catch (error) {
            console.error('Error adding card:', error.response || error);
            setError(`Failed to add card: ${error.response?.data?.error || error.message}`);
            alert('Failed to add card: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    // Handle edit card
    const handleEditCard = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!editCard.payment_type_id) {
                throw new Error("No card selected for editing");
            }

            const response = await axios.put(
                `http://localhost:5000/cards/editCard/${editCard.payment_type_id}`,
                editCard,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            alert(response.data.message || "Card updated successfully");

            // Refresh the card list
            fetchCards();

            // Reset the form
            setEditCard({ payment_type_id: null, card_number: '', card_holder_name: '', postal_code: '' });
        } catch (error) {
            console.error('Error editing card:', error.response || error);
            setError(`Failed to edit card: ${error.response?.data?.error || error.message}`);
            alert('Failed to edit card: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    // Handle delete card
    const handleDeleteCard = async (payment_type_id) => {
        if (window.confirm('Are you sure you want to delete this card?')) {
            setLoading(true);
            setError(null);

            try {
                const response = await axios.delete(
                    `http://localhost:5000/cards/deleteCard/${payment_type_id}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                alert(response.data.message || "Card deleted successfully");

                // Refresh the card list
                fetchCards();
            } catch (error) {
                console.error('Error deleting card:', error.response || error);
                setError(`Failed to delete card: ${error.response?.data?.error || error.message}`);
                alert('Failed to delete card: ' + (error.response?.data?.error || error.message));
            } finally {
                setLoading(false);
            }
        }
    };

    // Function to retry card fetching
    const retryFetchCards = () => {
        fetchCards();
    };

    return (
        <div className="manage-cards-container">
            <Header />
            <h1 className="page-title">{isAdmin ? "All Payment Cards" : "Manage Your Cards"}</h1>

            {error && (
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={retryFetchCards} className="retry-button">Retry</button>
                </div>
            )}

            {/* Only show add/edit card forms for regular users, not admins */}
            {!isAdmin && (
                <>
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
                                value={newCard.card_holder_name || userName}
                                onChange={(e) => setNewCard({ ...newCard, card_holder_name: e.target.value })}
                                required
                                className="form-input"
                                disabled={!!userName} // Disable if userName is set
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
                                    const cardId = parseInt(e.target.value);
                                    if (cardId) {
                                        const card = cards.find(card => card.payment_type_id === cardId);
                                        setEditCard(card || {
                                            payment_type_id: null,
                                            card_number: '',
                                            card_holder_name: '',
                                            postal_code: ''
                                        });
                                    } else {
                                        setEditCard({
                                            payment_type_id: null,
                                            card_number: '',
                                            card_holder_name: '',
                                            postal_code: ''
                                        });
                                    }
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
                                        disabled={!!userName} // Disable if userName is set
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
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </>
                            )}
                        </form>
                    </div>
                </>
            )}

            <div className="card-list">
                <h2 className="form-title">{isAdmin ? "All Payment Cards in System" : "Your Saved Cards"}</h2>
                {loading ? (
                    <div className="loading-spinner">Loading cards...</div>
                ) : cards.length === 0 ? (
                    <div className="empty-state">
                        <p>{isAdmin ? "No payment cards found in the system." : "You don't have any saved cards yet."}</p>
                        <button onClick={retryFetchCards} className="retry-button">Refresh</button>
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Cardholder Name</th>
                            <th>Card Number</th>
                            <th>Postal Code</th>
                            {!isAdmin && <th>Actions</th>}
                        </tr>
                        </thead>
                        <tbody>
                        {cards.map((card) => (
                            <tr key={card.payment_type_id}>
                                <td>{card.payment_type_id}</td>
                                <td>{card.card_holder_name}</td>
                                <td>{card.card_number}</td>
                                <td>{card.postal_code}</td>
                                {!isAdmin && (
                                    <td>
                                        <button
                                            onClick={() => handleDeleteCard(card.payment_type_id)}
                                            disabled={loading}
                                            className="delete-button"
                                        >
                                            {loading ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ManageCardsPage;
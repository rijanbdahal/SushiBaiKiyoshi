import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../AuthProvider';
import "../../css/css.css";
import Header from "../includes/header"; // Add your custom CSS file

const OrderPage = () => {
    const { user } = useContext(AuthContext); // Using user from AuthContext
    const [menuItems, setMenuItems] = useState([]);
    const [orderItems, setOrderItems] = useState([]);
    const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
    const [status, setStatus] = useState('Pending');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch menu items when the component mounts
    useEffect(() => {
        axios.get('http://localhost:5001/menuitems')
            .then((response) => {
                setMenuItems(response.data);
            })
            .catch((error) => console.error('Error fetching menu items:', error));
    }, []);

    // Fetch user's orders based on user_id
    useEffect(() => {
        if (user && user.user_id) {
            axios.get(`http://localhost:5001/handleorder/getItems/${user.user_id}`)
                .then((response) => setOrders(response.data))
                .catch((error) => console.error('Error fetching orders:', error));
        }
    }, [user]);

    // Handle quantity change for each menu item
    const handleQuantityChange = (menuItemId, quantity) => {
        setOrderItems((prevItems) => {
            const updatedItems = prevItems.filter(item => item.menu_item_id !== menuItemId);
            if (quantity > 0) {
                const menuItem = menuItems.find(item => item.menu_item_id === menuItemId);
                updatedItems.push({
                    menu_item_id: menuItemId,
                    quantity,
                    price: menuItem?.price || 0
                });
            }
            return updatedItems;
        });
    };

    // Handle form submission to place an order
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user?.user_id || orderItems.length === 0) {
            alert("Please select at least one menu item.");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5001/handleorder', {
                user_id: user.user_id,
                order_date: orderDate,
                items: orderItems,
                status
            });

            alert(`Order placed successfully! Order ID: ${response.data.orderId}`);
            setOrders([...orders, response.data]);
            setOrderItems([]);
        } catch (error) {
            console.error('Error placing the order:', error);
            alert(`Failed to place the order: ${error.response?.data?.error || "Unknown error"}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="order-page-container">
            <Header/>
            <h1 className="page-title">Place Your Order</h1>
            <form onSubmit={handleSubmit} className="order-form">
                <div className="form-section">
                    <label>Order Date:</label>
                    <input
                        type="date"
                        className="form-input"
                        value={orderDate}
                        onChange={(e) => setOrderDate(e.target.value)}
                    />
                </div>

                <div className="form-section">
                    <h2>Menu Items</h2>
                    {menuItems.map((item) => (
                        <div key={item.menu_item_id} className="menu-item">
                            <label className="menu-item-label">
                                {item.menu_item_name} - ${item.price.toFixed(2)}
                            </label>
                            <input
                                type="number"
                                min="0"
                                placeholder="Quantity"
                                className="menu-item-input"
                                onChange={(e) => handleQuantityChange(item.menu_item_id, parseInt(e.target.value) || 0)}
                            />
                        </div>
                    ))}
                </div>

                <button type="submit" className="order-button" disabled={loading}>
                    {loading ? "Placing Order..." : "Place Order"}
                </button>
            </form>

            <h2>Your Orders</h2>
            {orders.length === 0 ? (
                <p>No orders placed yet.</p>
            ) : (
                <ul className="order-list">
                    {orders.map((order) => (
                        <li key={order.order_id} className="order-item">
                            <span className="order-item-label">
                                Order #{order.order_id} - {order.order_date} - {order.status} - ${order.total.toFixed(2)}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default OrderPage;

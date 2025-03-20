import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../AuthProvider';
import "../../css/css.css";
import Header from "../includes/header"; // Add your custom CSS file

const ManageOrdersPage = () => {
    const { user } = useContext(AuthContext);  // Using user context to fetch orders
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch all orders for the user or admin
    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const response = await axios.get('http://localhost:5000/handleorder/getAllOrders');
                setOrders(response.data);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // Handle order deletion
    const handleDeleteOrder = async (orderId) => {
        if (window.confirm('Are you sure you want to delete this order?')) {
            setLoading(true);
            try {
                const response = await axios.delete(`http://localhost:5000/handleorder/deleteOrder/${orderId}`);
                alert(response.data.message);
                // Refresh the orders list
                setOrders(orders.filter(order => order.order_id !== orderId));
            } catch (error) {
                console.error('Error deleting order:', error);
                alert('Failed to delete the order.');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="manage-orders-container">
            <Header/>
            <h1>Manage Orders</h1>
            {loading && <p className="loading-text">Loading orders...</p>}
            {!loading && orders.length === 0 && <p>No orders available.</p>}
            <div className="orders-list">
                {orders.map((order) => (
                    <div className="order-item" key={order.order_id}>
                        <div className="order-details">
                            <p><strong>Order #{order.order_id}</strong></p>
                            <p><strong>Date:</strong> {order.order_date}</p>
                            <p><strong>Status:</strong> {order.status}</p>
                            <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
                        </div>
                        <button className="delete-button" onClick={() => handleDeleteOrder(order.order_id)}>
                            Delete Order
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManageOrdersPage;

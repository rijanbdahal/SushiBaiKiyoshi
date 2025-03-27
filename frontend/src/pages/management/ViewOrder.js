import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../AuthProvider';
import "../../css/css.css";
import Header from "../includes/header";

const ManageOrdersPage = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5001/handleorder/getAllOrders');
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [user]);

    const updateOrderStatus = (orderId, newStatus) => {
        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.order_id === orderId ? { ...order, status: newStatus } : order
            )
        );
    };

    const completeOrder = async (orderId) => {
        setLoading(true);
        try {
            const response = await axios.put(`http://localhost:5001/handleorder/completeOrder/${orderId}`);
            alert(response.data.message);
            updateOrderStatus(orderId, 'Completed');
        } catch (error) {
            console.error('Error completing order:', error);
            alert('Failed to complete the order.');
        } finally {
            setLoading(false);
        }
    };

    const processOrder = async (orderId) => {
        setLoading(true);
        try {
            const response = await axios.put(`http://localhost:5001/handleorder/processOrder/${orderId}`);
            alert(response.data.message);
            updateOrderStatus(orderId, 'Processing');
        } catch (error) {
            console.error('Error processing order:', error);
            alert('Failed to process the order.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (window.confirm('Are you sure you want to delete this order?')) {
            setLoading(true);
            try {
                const response = await axios.delete(`http://localhost:5001/handleorder/deleteOrder/${orderId}`);
                alert(response.data.message);
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
            <Header />
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
                            <p><strong>Total:</strong> ${order.total ? order.total.toFixed(2) : "N/A"}</p>
                        </div>
                        {order.status !== 'Completed' && (
                            <>
                                {order.status === 'Pending' && (
                                    <button className="edit-button" onClick={() => processOrder(order.order_id)}>
                                        Process Order
                                    </button>
                                )}
                                {order.status === 'Processing' && (
                                    <button className="edit-button" onClick={() => completeOrder(order.order_id)}>
                                        Complete Order
                                    </button>
                                )}
                            </>
                        )}
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

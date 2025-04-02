import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../AuthProvider';
import "../../css/css.css";
import Header from "../includes/header";

const ManageOrdersPage = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState('All');

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
            const response = await axios.put(`http://localhost:5000/handleorder/completeOrder/${orderId}`);
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
            const response = await axios.put(`http://localhost:5000/handleorder/processOrder/${orderId}`);
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
                const response = await axios.delete(`http://localhost:5000/handleorder/deleteOrder/${orderId}`);
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

    const filteredOrders = filterStatus === 'All' 
        ? orders 
        : orders.filter(order => order.status === filterStatus);

    return (
        <div className="manage-orders-container">
            <Header />
            <h1>Manage Orders</h1>
            
            <div className="filter-controls">
                <label htmlFor="statusFilter">Filter by Status: </label>
                <select 
                    id="statusFilter" 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="status-filter"
                >
                    <option value="All">All Orders</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Completed">Completed</option>
                </select>
            </div>
            
            {loading && <p className="loading-text">Loading orders...</p>}
            {!loading && filteredOrders.length === 0 && <p>No orders available with the selected filter.</p>}
            
            <div className="orders-list">
                {filteredOrders.map((order) => (
                    <div className={`order-item order-status-${order.status.toLowerCase()}`} key={order.order_id}>
                        <div className="order-details">
                            <p><strong>Order #{order.order_id}</strong></p>
                            <p><strong>Date:</strong> {order.order_date}</p>
                            <p><strong>Status:</strong> <span className={`status-badge status-${order.status.toLowerCase()}`}>{order.status}</span></p>
                            <p><strong>Total:</strong> ${order.total ? order.total.toFixed(2) : "N/A"}</p>
                        </div>
                        <div className="order-actions">
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
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManageOrdersPage;

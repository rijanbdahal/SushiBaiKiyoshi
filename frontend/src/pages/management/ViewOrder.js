import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../AuthProvider';
import "../../css/css.css";
import Header from "../includes/header";

const ManageOrdersPage = () => {
    const { token, user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'order_id', direction: 'descending' });
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/handleorder/getAllOrders', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
            showNotification('Failed to fetch orders. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Since there's no direct endpoint to get order items, we'll create some sample items
// In a real implementation, you would create a backend endpoint for this
    const fetchOrderItems = async (orderId) => {
        try {
            // Simulate an API call with mock data - in production, replace with actual API
            // The backend needs to be updated to add a getOrderItems/:orderId endpoint

            // Mock data - replace this with actual API call when backend is updated
            const sampleItems = [
                {
                    menu_item_id: 1,
                    menu_item_name: 'Grilled Atlantic Salmon',
                    quantity: 2,
                    price: 22.99
                },
                {
                    menu_item_id: 8,
                    menu_item_name: 'Garlic Shrimp Pasta',
                    quantity: 1,
                    price: 20.99
                }
            ];

            // Simulate network delay
            setTimeout(() => {
                setOrderItems(sampleItems);
            }, 500);

            // Future implementation would use this:
            /*
            const response = await axios.get(`http://localhost:5000/handleorder/getOrderItems/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            setOrderItems(response.data || []);
            */
        } catch (error) {
            console.error('Error fetching order items:', error);
            showNotification('Failed to fetch order details.', 'error');
            setOrderItems([]);
        }
    };

    useEffect(() => {
        if (token) {
            fetchOrders();
        }
    }, [token]);

    useEffect(() => {
        if (selectedOrder) {
            fetchOrderItems(selectedOrder.order_id);
        } else {
            setOrderItems([]);
        }
    }, [selectedOrder]);

    // Sort function
    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Get filtered and sorted orders
    const getFilteredOrders = () => {
        let filteredResults = [...orders];

        // Apply date range filter
        if (dateRange.start && dateRange.end) {
            const startDate = new Date(dateRange.start);
            const endDate = new Date(dateRange.end);
            endDate.setHours(23, 59, 59, 999); // Set to end of day

            filteredResults = filteredResults.filter(order => {
                const orderDate = new Date(order.order_date);
                return orderDate >= startDate && orderDate <= endDate;
            });
        } else if (dateRange.start) {
            const startDate = new Date(dateRange.start);
            filteredResults = filteredResults.filter(order => {
                const orderDate = new Date(order.order_date);
                return orderDate >= startDate;
            });
        } else if (dateRange.end) {
            const endDate = new Date(dateRange.end);
            endDate.setHours(23, 59, 59, 999); // Set to end of day
            filteredResults = filteredResults.filter(order => {
                const orderDate = new Date(order.order_date);
                return orderDate <= endDate;
            });
        }

        // Apply status filter
        if (filterStatus !== 'All') {
            filteredResults = filteredResults.filter(order => order.status === filterStatus);
        }

        // Apply search filter (search by order ID or customer name if available)
        if (searchTerm) {
            filteredResults = filteredResults.filter(order =>
                order.order_id.toString().includes(searchTerm) ||
                (order.customer_name && order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                order.order_date.includes(searchTerm) ||
                (order.user_id && order.user_id.toString().includes(searchTerm))
            );
        }

        // Apply sorting
        if (sortConfig.key) {
            filteredResults.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                if (sortConfig.key === 'order_id' || sortConfig.key === 'total') {
                    aValue = Number(aValue) || 0;
                    bValue = Number(bValue) || 0;
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }

        return filteredResults;
    };

    const updateOrderStatus = (orderId, newStatus) => {
        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.order_id === orderId ? { ...order, status: newStatus } : order
            )
        );

        // Update selected order if it's the one being modified
        if (selectedOrder && selectedOrder.order_id === orderId) {
            setSelectedOrder({...selectedOrder, status: newStatus});
        }
    };

    const completeOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to mark this order as completed?')) {
            return;
        }

        setLoading(true);
        try {
            const response = await axios.put(`http://localhost:5000/handleorder/completeOrder/${orderId}`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            updateOrderStatus(orderId, 'Completed');

            // Show success notification
            const orderNumber = orders.find(o => o.order_id === orderId)?.order_id;
            showNotification(`Order #${orderNumber} has been completed successfully!`, 'success');
        } catch (error) {
            console.error('Error completing order:', error);
            showNotification('Failed to complete the order.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const processOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to start processing this order?')) {
            return;
        }

        setLoading(true);
        try {
            const response = await axios.put(`http://localhost:5000/handleorder/processOrder/${orderId}`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            updateOrderStatus(orderId, 'Processing');

            // Show success notification
            const orderNumber = orders.find(o => o.order_id === orderId)?.order_id;
            showNotification(`Order #${orderNumber} is now being processed.`, 'success');
        } catch (error) {
            console.error('Error processing order:', error);
            showNotification('Failed to process the order.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
            return;
        }

        setLoading(true);
        try {
            const response = await axios.delete(`http://localhost:5000/handleorder/deleteOrder/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // If the deleted order is currently selected, clear selection
            if (selectedOrder && selectedOrder.order_id === orderId) {
                setSelectedOrder(null);
            }

            setOrders(orders.filter(order => order.order_id !== orderId));
            showNotification('Order has been deleted successfully.', 'success');
        } catch (error) {
            console.error('Error deleting order:', error);
            showNotification('Failed to delete the order.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (message, type = 'info') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);

        // Auto remove notification after 5 seconds
        setTimeout(() => {
            setNotifications(prev => prev.filter(notification => notification.id !== id));
        }, 5000);
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    };

    const clearFilters = () => {
        setFilterStatus('All');
        setSearchTerm('');
        setDateRange({ start: '', end: '' });
    };

    const getStatusCounts = () => {
        const counts = {
            total: orders.length,
            Pending: orders.filter(order => order.status === 'Pending').length,
            Processing: orders.filter(order => order.status === 'Processing').length,
            Completed: orders.filter(order => order.status === 'Completed').length
        };
        return counts;
    };

    const statusCounts = getStatusCounts();

    return (
        <div className="manage-orders-container">
            <Header />
            <div className="container">
                <h1 className="page-title">Order Management</h1>

                {/* Notification system */}
                <div className="notifications-container">
                    {notifications.map(notification => (
                        <div key={notification.id} className={`notification notification-${notification.type}`}>
                            <div className="notification-content">{notification.message}</div>
                            <button className="notification-close" onClick={() => removeNotification(notification.id)}>×</button>
                        </div>
                    ))}
                </div>

                <div className="orders-dashboard">
                    <div className="orders-summary">
                        <div className="summary-card">
                            <div className="summary-title">Total Orders</div>
                            <div className="summary-value">{statusCounts.total}</div>
                        </div>
                        <div className="summary-card">
                            <div className="summary-title">Pending</div>
                            <div className="summary-value">
                                {statusCounts.Pending}
                            </div>
                        </div>
                        <div className="summary-card">
                            <div className="summary-title">Processing</div>
                            <div className="summary-value">
                                {statusCounts.Processing}
                            </div>
                        </div>
                        <div className="summary-card">
                            <div className="summary-title">Completed</div>
                            <div className="summary-value">
                                {statusCounts.Completed}
                            </div>
                        </div>
                    </div>

                    <div className="filters-section">
                        <div className="search-filters">
                            <div className="form-group">
                                <label htmlFor="searchTerm">Search Orders</label>
                                <input
                                    id="searchTerm"
                                    type="text"
                                    placeholder="Search by order ID, customer name or date..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="form-input"
                                />
                            </div>

                            <div className="filter-row">
                                <div className="form-group date-range">
                                    <label>Date Range</label>
                                    <div className="date-inputs">
                                        <input
                                            type="date"
                                            value={dateRange.start}
                                            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                                            className="form-input"
                                            placeholder="Start Date"
                                        />
                                        <span className="date-separator">to</span>
                                        <input
                                            type="date"
                                            value={dateRange.end}
                                            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                                            className="form-input"
                                            placeholder="End Date"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="statusFilter">Status Filter</label>
                                    <select
                                        id="statusFilter"
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="form-select"
                                    >
                                        <option value="All">All Orders</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Processing">Processing</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>

                                <div className="form-group filter-actions">
                                    <label>&nbsp;</label>
                                    <button
                                        onClick={clearFilters}
                                        className="clear-filters-button"
                                        disabled={!searchTerm && !dateRange.start && !dateRange.end && filterStatus === 'All'}
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="orders-content">
                        <div className="orders-table-container">
                            {loading ? (
                                <div className="loading-spinner">
                                    <div className="spinner"></div>
                                    <p>Loading orders data...</p>
                                </div>
                            ) : getFilteredOrders().length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">📋</div>
                                    <p className="empty-title">No Orders Found</p>
                                    <p>No orders matched your search criteria.</p>
                                    {(searchTerm || dateRange.start || dateRange.end || filterStatus !== 'All') && (
                                        <button onClick={clearFilters} className="reset-button">Reset Filters</button>
                                    )}
                                </div>
                            ) : (
                                <table className="orders-table">
                                    <thead>
                                    <tr>
                                        <th onClick={() => requestSort('order_id')} className="sortable-header">
                                            Order #
                                            {sortConfig.key === 'order_id' && (
                                                <span className="sort-indicator">
                                                        {sortConfig.direction === 'ascending' ? '▲' : '▼'}
                                                    </span>
                                            )}
                                        </th>
                                        <th onClick={() => requestSort('user_id')} className="sortable-header">
                                            Customer
                                            {sortConfig.key === 'user_id' && (
                                                <span className="sort-indicator">
                                                        {sortConfig.direction === 'ascending' ? '▲' : '▼'}
                                                    </span>
                                            )}
                                        </th>
                                        <th onClick={() => requestSort('order_date')} className="sortable-header">
                                            Date
                                            {sortConfig.key === 'order_date' && (
                                                <span className="sort-indicator">
                                                        {sortConfig.direction === 'ascending' ? '▲' : '▼'}
                                                    </span>
                                            )}
                                        </th>
                                        <th onClick={() => requestSort('status')} className="sortable-header">
                                            Status
                                            {sortConfig.key === 'status' && (
                                                <span className="sort-indicator">
                                                        {sortConfig.direction === 'ascending' ? '▲' : '▼'}
                                                    </span>
                                            )}
                                        </th>
                                        <th onClick={() => requestSort('total')} className="sortable-header">
                                            Total
                                            {sortConfig.key === 'total' && (
                                                <span className="sort-indicator">
                                                        {sortConfig.direction === 'ascending' ? '▲' : '▼'}
                                                    </span>
                                            )}
                                        </th>
                                        <th>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {getFilteredOrders().map((order) => (
                                        <tr
                                            key={order.order_id}
                                            className={`
                                                    ${selectedOrder?.order_id === order.order_id ? 'selected-row' : ''}
                                                    ${order.status === 'Pending' ? 'pending-row' : ''}
                                                    ${order.status === 'Processing' ? 'processing-row' : ''}
                                                    ${order.status === 'Completed' ? 'completed-row' : ''}
                                                `}
                                            onClick={() => setSelectedOrder(order)}
                                        >
                                            <td className="order-id-cell">{order.order_id}</td>
                                            <td className="customer-cell">ID: {order.customer_id || "N/A"}</td>
                                            <td className="date-cell">{new Date(order.order_date).toLocaleDateString()}</td>
                                            <td>
                                                    <span className={`status-badge status-${order.status.toLowerCase()}`}>
                                                        {order.status}
                                                    </span>
                                            </td>
                                            <td className="order-total">${order.total ? parseFloat(order.total).toFixed(2) : "0.00"}</td>
                                            <td>
                                                <div className="table-actions">
                                                    <button
                                                        className="view-button"
                                                        title="View Order Details"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedOrder(order);
                                                        }}
                                                    >
                                                        View
                                                    </button>

                                                    {order.status === 'Pending' && (
                                                        <button
                                                            className="process-button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                processOrder(order.order_id);
                                                            }}
                                                            disabled={loading}
                                                        >
                                                            Process
                                                        </button>
                                                    )}

                                                    {order.status === 'Processing' && (
                                                        <button
                                                            className="complete-button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                completeOrder(order.order_id);
                                                            }}
                                                            disabled={loading}
                                                        >
                                                            Complete
                                                        </button>
                                                    )}

                                                    <button
                                                        className="delete-button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteOrder(order.order_id);
                                                        }}
                                                        disabled={loading}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {selectedOrder && (
                            <div className="order-details-panel">
                                <div className="panel-header">
                                    <h2>Order #{selectedOrder.order_id} Details</h2>
                                    <button className="close-button" onClick={() => setSelectedOrder(null)}>×</button>
                                </div>

                                <div className="order-details-content">
                                    <div className="order-info-card">
                                        <h3>Order Information</h3>
                                        <div className="info-grid">
                                            <div className="info-row">
                                                <div className="info-label">Order Date:</div>
                                                <div className="info-value">{new Date(selectedOrder.order_date).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}</div>
                                            </div>
                                            <div className="info-row">
                                                <div className="info-label">Status:</div>
                                                <div className="info-value">
                                                    <span className={`status-badge status-${selectedOrder.status.toLowerCase()}`}>
                                                        {selectedOrder.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="info-row">
                                                <div className="info-label">Customer ID:</div>
                                                <div className="info-value">{selectedOrder.customer_id || "N/A"}</div>
                                            </div>
                                            <div className="info-row">
                                                <div className="info-label">Total Amount:</div>
                                                <div className="info-value order-total">${selectedOrder.total ? parseFloat(selectedOrder.total).toFixed(2) : "0.00"}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="order-items-card">
                                        <h3>Order Items</h3>
                                        {loading ? (
                                            <div className="loading-spinner">
                                                <div className="spinner small"></div>
                                                <p>Loading items...</p>
                                            </div>
                                        ) : orderItems.length === 0 ? (
                                            <p className="no-items">No items found for this order.</p>
                                        ) : (
                                            <div className="items-table-wrapper">
                                                <table className="items-table">
                                                    <thead>
                                                    <tr>
                                                        <th>Item</th>
                                                        <th>Quantity</th>
                                                        <th>Price</th>
                                                        <th>Total</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {orderItems.map((item, index) => (
                                                        <tr key={index}>
                                                            <td>{item.menu_item_name || item.item_name || `Item #${item.menu_item_id || item.item_id || index}`}</td>
                                                            <td>{item.quantity}</td>
                                                            <td>${parseFloat(item.price || 0).toFixed(2)}</td>
                                                            <td>${parseFloat((item.price || 0) * (item.quantity || 0)).toFixed(2)}</td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                    <tfoot>
                                                    <tr>
                                                        <td colSpan="3" className="total-label">Total:</td>
                                                        <td className="order-total">${selectedOrder.total ? parseFloat(selectedOrder.total).toFixed(2) : "0.00"}</td>
                                                    </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        )}
                                    </div>

                                    <div className="panel-actions">
                                        {selectedOrder.status === 'Pending' && (
                                            <button
                                                className="process-button"
                                                onClick={() => processOrder(selectedOrder.order_id)}
                                                disabled={loading}
                                            >
                                                <span className="button-icon">🔄</span>
                                                Process Order
                                            </button>
                                        )}

                                        {selectedOrder.status === 'Processing' && (
                                            <button
                                                className="complete-button"
                                                onClick={() => completeOrder(selectedOrder.order_id)}
                                                disabled={loading}
                                            >
                                                <span className="button-icon">✓</span>
                                                Complete Order
                                            </button>
                                        )}

                                        <button
                                            className="delete-button"
                                            onClick={() => handleDeleteOrder(selectedOrder.order_id)}
                                            disabled={loading}
                                        >
                                            <span className="button-icon">🗑️</span>
                                            Delete Order
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageOrdersPage;
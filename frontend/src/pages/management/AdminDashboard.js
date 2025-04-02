import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../AuthProvider";
import { useNavigate, Link } from "react-router-dom";
import Header from "../includes/header";
import axios from "axios";
import '../../css/css.css';

const AdminDashboard = () => {
    const { token, user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [dashboardStats, setDashboardStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        totalUsers: 0,
        lowStockItems: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        // Check if user is admin
        if (user && user.user_type !== "A") {
            navigate("/dashboard");
            return;
        }

        const fetchAdminDashboardData = async () => {
            try {
                // Use mock data since the required backend APIs don't exist yet
                // In a real implementation, you would call the actual APIs
                
                // Mock orders data
                const mockOrders = [
                    { order_id: 101, user_id: 1, order_date: '2025-04-01', status: 'Pending', total: 89.95 },
                    { order_id: 102, user_id: 2, order_date: '2025-04-01', status: 'Completed', total: 124.50 },
                    { order_id: 103, user_id: 3, order_date: '2025-03-30', status: 'Processing', total: 75.20 },
                    { order_id: 104, user_id: 1, order_date: '2025-03-29', status: 'Completed', total: 54.75 },
                    { order_id: 105, user_id: 4, order_date: '2025-03-28', status: 'Pending', total: 112.30 }
                ];
                
                const allOrders = mockOrders;
                const pendingOrders = allOrders.filter(order => order.status === 'Pending').length;
                
                // Set recent orders (already sorted by date)
                setRecentOrders(allOrders);
                
                // Mock data for other stats
                const mockUserCount = 24;
                const mockLowStockItems = 3;
                
                setDashboardStats({
                    totalOrders: allOrders.length,
                    pendingOrders: pendingOrders,
                    totalUsers: mockUserCount,
                    lowStockItems: mockLowStockItems
                });
                
            } catch (error) {
                console.error("Error fetching admin dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAdminDashboardData();
    }, [token, navigate, user]);

    const getCurrentDate = () => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date().toLocaleDateString('en-US', options);
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <Header />
                <div className="container">
                    <div className="loading-spinner">Loading admin dashboard...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <Header />
            <div className="container">
                <div className="dashboard-header">
                    <div className="welcome-section">
                        <h1 className="dashboard-title">Admin Dashboard</h1>
                        <p className="dashboard-date">{getCurrentDate()}</p>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-title">Total Orders</div>
                        <div className="stat-value">{dashboardStats.totalOrders}</div>
                        <div className="stat-link">
                            <Link to="/vieworder">Manage Orders</Link>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-title">Pending Orders</div>
                        <div className="stat-value">{dashboardStats.pendingOrders}</div>
                        {dashboardStats.pendingOrders > 0 && (
                            <div className="stat-note">Orders awaiting processing</div>
                        )}
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-title">Total Users</div>
                        <div className="stat-value">{dashboardStats.totalUsers}</div>
                        <div className="stat-link">
                            <Link to="/edituser">Manage Users</Link>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-title">Low Stock Items</div>
                        <div className="stat-value">{dashboardStats.lowStockItems}</div>
                        <div className="stat-link">
                            <Link to="/inventory">View Inventory</Link>
                        </div>
                    </div>
                </div>

                <div className="dashboard-sections">
                    <div className="dashboard-section">
                        <h2 className="section-title">Recent Orders</h2>
                        {recentOrders.length > 0 ? (
                            <div className="recent-orders">
                                {recentOrders.map((order) => (
                                    <div key={order.order_id} className="order-card">
                                        <div className="order-details">
                                            <div className="order-id">Order #{order.order_id}</div>
                                            <div className="order-date">{order.order_date}</div>
                                            <div className={`order-status status-${order.status.toLowerCase()}`}>
                                                {order.status}
                                            </div>
                                            <div className="order-user">Customer ID: {order.user_id}</div>
                                        </div>
                                        <div className="order-amount">${order.total?.toFixed(2)}</div>
                                    </div>
                                ))}
                                <div className="dashboard-action">
                                    <Link to="/vieworder" className="dashboard-button">View All Orders</Link>
                                </div>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p>No orders in the system.</p>
                            </div>
                        )}
                    </div>

                    <div className="dashboard-section">
                        <h2 className="section-title">Admin Actions</h2>
                        <div className="action-grid">
                            <Link to="/inventory" className="action-card">
                                <div className="action-icon">📦</div>
                                <div className="action-title">Inventory</div>
                                <div className="action-description">Manage product inventory</div>
                            </Link>
                            
                            <Link to="/addmenuitems" className="action-card">
                                <div className="action-icon">🍽️</div>
                                <div className="action-title">Menu Items</div>
                                <div className="action-description">Add & edit menu items</div>
                            </Link>
                            
                            <Link to="/receivefish" className="action-card">
                                <div className="action-icon">🐟</div>
                                <div className="action-title">Receive Fish</div>
                                <div className="action-description">Process new fish inventory</div>
                            </Link>
                            
                            <Link to="/addsupplieraddress" className="action-card">
                                <div className="action-icon">🏢</div>
                                <div className="action-title">Suppliers</div>
                                <div className="action-description">Manage supplier information</div>
                            </Link>
                            
                            <Link to="/analytics" className="action-card">
                                <div className="action-icon">📈</div>
                                <div className="action-title">Analytics</div>
                                <div className="action-description">View business analytics</div>
                            </Link>
                            
                            <Link to="/edituser" className="action-card">
                                <div className="action-icon">👥</div>
                                <div className="action-title">Users</div>
                                <div className="action-description">Manage user accounts</div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
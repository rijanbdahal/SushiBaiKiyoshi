import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../AuthProvider";
import { useNavigate, Link } from "react-router-dom";
import Header from "../includes/header";
import axios from "axios";
import '../../css/css.css';

const CustomerDashboard = () => {
    const { token, user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [recentOrders, setRecentOrders] = useState([]);
    const [statsSummary, setStatsSummary] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        savingsToDate: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        const fetchDashboardData = async () => {
            try {
                if (user?.user_id) {
                    // Fetch recent orders
                    const ordersResponse = await axios.get(
                        `http://localhost:5000/handleorder/getItems/${user.user_id}`,
                        {
                            headers: { Authorization: `Bearer ${token}` }
                        }
                    );
                    
                    // Get up to 5 recent orders
                    const recent = ordersResponse.data.slice(0, 5);
                    setRecentOrders(recent);
                    
                    // Calculate stats
                    const allOrders = ordersResponse.data;
                    const pendingOrders = allOrders.filter(order => order.status === 'Pending').length;
                    const completedOrders = allOrders.filter(order => order.status === 'Completed').length;
                    
                    // Calculate approximate savings (assuming 10% discount on eligible items)
                    let totalSavings = 0;
                    allOrders.forEach(order => {
                        // If the order has a discounted field, use it to calculate savings
                        if (order.discounted_amount) {
                            totalSavings += order.discounted_amount;
                        }
                    });
                    
                    setStatsSummary({
                        totalOrders: allOrders.length,
                        pendingOrders,
                        completedOrders,
                        savingsToDate: totalSavings.toFixed(2)
                    });
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
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
                    <div className="loading-spinner">Loading dashboard data...</div>
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
                        <h1 className="dashboard-title">Welcome back, {user?.first_name}!</h1>
                        <p className="dashboard-date">{getCurrentDate()}</p>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-title">Total Orders</div>
                        <div className="stat-value">{statsSummary.totalOrders}</div>
                        <div className="stat-link">
                            <Link to="/placeorder">Place New Order</Link>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-title">Pending Orders</div>
                        <div className="stat-value">{statsSummary.pendingOrders}</div>
                        {statsSummary.pendingOrders > 0 && (
                            <div className="stat-note">You have orders awaiting processing</div>
                        )}
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-title">Completed Orders</div>
                        <div className="stat-value">{statsSummary.completedOrders}</div>
                        <div className="stat-link">
                            <Link to="/viewprofile">View Order History</Link>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-title">Your Savings</div>
                        <div className="stat-value">${statsSummary.savingsToDate}</div>
                        <div className="stat-note">Total savings from discounts</div>
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
                                        </div>
                                        <div className="order-amount">${order.total?.toFixed(2)}</div>
                                    </div>
                                ))}
                                <div className="dashboard-action">
                                    <Link to="/placeorder" className="dashboard-button">View All Orders</Link>
                                </div>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p>You haven't placed any orders yet.</p>
                                <Link to="/placeorder" className="dashboard-button">Place Your First Order</Link>
                            </div>
                        )}
                    </div>

                    <div className="dashboard-section">
                        <h2 className="section-title">Quick Actions</h2>
                        <div className="action-grid">
                            <Link to="/placeorder" className="action-card">
                                <div className="action-icon">🛒</div>
                                <div className="action-title">Place New Order</div>
                                <div className="action-description">Browse our menu and place your order</div>
                            </Link>
                            
                            <Link to="/viewprofile" className="action-card">
                                <div className="action-icon">👤</div>
                                <div className="action-title">Update Profile</div>
                                <div className="action-description">Manage your account information</div>
                            </Link>
                            
                            <Link to="/carddetails" className="action-card">
                                <div className="action-icon">💳</div>
                                <div className="action-title">Payment Methods</div>
                                <div className="action-description">Manage your payment options</div>
                            </Link>
                            
                            <div className="action-card" onClick={logout}>
                                <div className="action-icon">🚪</div>
                                <div className="action-title">Logout</div>
                                <div className="action-description">Securely sign out of your account</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;
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
    const [userDiscounts, setUserDiscounts] = useState([]);
    const [orderTotal, setOrderTotal] = useState(0);
    const [originalTotal, setOriginalTotal] = useState(0);

    // Fetch menu items when the component mounts
    useEffect(() => {
        axios.get('http://localhost:5000/menuitems')
            .then((response) => {
                setMenuItems(response.data);
            })
            .catch((error) => console.error('Error fetching menu items:', error));
    }, []);

    // Fetch user's orders based on user_id
    useEffect(() => {
        if (user && user.user_id) {
            axios.get(`http://localhost:5000/handleorder/getItems/${user.user_id}`)
                .then((response) => setOrders(response.data))
                .catch((error) => console.error('Error fetching orders:', error));
            
            // Fetch user's discounts
            axios.get(`http://localhost:5000/handleorder/discounts/${user.user_id}`)
                .then((response) => setUserDiscounts(response.data))
                .catch((error) => console.error('Error fetching discounts:', error));
        }
    }, [user]);
    
    // Calculate totals whenever order items change
    useEffect(() => {
        if (orderItems.length === 0) {
            setOrderTotal(0);
            setOriginalTotal(0);
            return;
        }
        
        let discountedTotal = 0;
        let original = 0;
        
        orderItems.forEach(item => {
            const menuItem = menuItems.find(mi => mi.menu_item_id === item.menu_item_id);
            const discount = userDiscounts.find(d => 
                d.menu_item_id === item.menu_item_id && d.discount_eligible
            );
            
            const originalPrice = menuItem?.price || 0;
            const price = discount ? originalPrice * 0.9 : originalPrice;
            
            original += originalPrice * item.quantity;
            discountedTotal += price * item.quantity;
        });
        
        setOriginalTotal(original);
        setOrderTotal(discountedTotal);
    }, [orderItems, menuItems, userDiscounts]);

    // Handle quantity change for each menu item
    const handleQuantityChange = (menuItemId, quantity) => {
        setOrderItems((prevItems) => {
            const updatedItems = prevItems.filter(item => item.menu_item_id !== menuItemId);
            if (quantity > 0) {
                const menuItem = menuItems.find(item => item.menu_item_id === menuItemId);
                const discount = userDiscounts.find(d => 
                    d.menu_item_id === menuItemId && d.discount_eligible
                );
                
                const originalPrice = menuItem?.price || 0;
                const price = discount ? originalPrice * 0.9 : originalPrice;
                
                updatedItems.push({
                    menu_item_id: menuItemId,
                    quantity,
                    price: price,
                    original_price: originalPrice,
                    has_discount: !!discount
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
            const response = await axios.post('http://localhost:5000/handleorder', {
                user_id: user.user_id,
                order_date: orderDate,
                items: orderItems,
                status
            });

            alert(`Order placed successfully! Order ID: ${response.data.orderId}`);
            
            // Update orders list with the new order
            const newOrder = {
                order_id: response.data.orderId,
                order_date: orderDate,
                status: status,
                total: orderTotal
            };
            
            setOrders([newOrder, ...orders]);
            setOrderItems([]);
            
            // Refresh discount information after order is placed
            axios.get(`http://localhost:5000/handleorder/discounts/${user.user_id}`)
                .then((response) => setUserDiscounts(response.data))
                .catch((error) => console.error('Error fetching updated discounts:', error));
                
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
            <div className="container">
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
                        <div className="menu-items-grid">
                            {menuItems.map((item) => {
                                const discount = userDiscounts.find(d => 
                                    d.menu_item_id === item.menu_item_id && d.discount_eligible
                                );
                                
                                return (
                                    <div key={item.menu_item_id} className="menu-item-card">
                                        <div className="menu-item-details">
                                            <h3 className="menu-item-name">{item.menu_item_name}</h3>
                                            {discount ? (
                                                <div className="price-display">
                                                    <span className="original-price">${item.price.toFixed(2)}</span>
                                                    <span className="discounted-price">${(item.price * 0.9).toFixed(2)}</span>
                                                    <span className="discount-badge">10% OFF</span>
                                                </div>
                                            ) : (
                                                <div className="price-display">
                                                    <span className="regular-price">${item.price.toFixed(2)}</span>
                                                </div>
                                            )}
                                            {discount && (
                                                <div className="discount-info">
                                                    You qualify for a loyalty discount!
                                                </div>
                                            )}
                                        </div>
                                        <div className="quantity-control">
                                            <label>Quantity:</label>
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="0"
                                                className="menu-item-input"
                                                onChange={(e) => handleQuantityChange(item.menu_item_id, parseInt(e.target.value) || 0)}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    
                    {orderItems.length > 0 && (
                        <div className="order-summary">
                            <h3>Order Summary</h3>
                            <div className="order-items-list">
                                {orderItems.map((item, index) => {
                                    const menuItem = menuItems.find(mi => mi.menu_item_id === item.menu_item_id);
                                    return (
                                        <div key={index} className="summary-item">
                                            <span className="item-name">{menuItem?.menu_item_name} <span className="item-quantity">x {item.quantity}</span></span>
                                            {item.has_discount ? (
                                                <span className="price-display">
                                                    <span className="original-price">${(item.original_price * item.quantity).toFixed(2)}</span>
                                                    <span className="discounted-price">${(item.price * item.quantity).toFixed(2)}</span>
                                                </span>
                                            ) : (
                                                <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            
                            <div className="order-totals">
                                {originalTotal !== orderTotal && (
                                    <div className="original-total">Original Total: ${originalTotal.toFixed(2)}</div>
                                )}
                                <div className="final-total">
                                    Total: ${orderTotal.toFixed(2)}
                                    {originalTotal !== orderTotal && (
                                        <span className="savings-badge">
                                            You save ${(originalTotal - orderTotal).toFixed(2)}!
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <button type="submit" className="order-button" disabled={loading}>
                        {loading ? "Placing Order..." : "Place Order"}
                    </button>
                </form>

                <div className="order-history">
                    <h2>Your Order History</h2>
                    {orders.length === 0 ? (
                        <div className="no-data-message">
                            <p>No orders placed yet.</p>
                            <p>Your order history will appear here after you place your first order.</p>
                        </div>
                    ) : (
                        <ul className="order-list">
                            {orders.map((order) => (
                                <li key={order.order_id} className="order-item">
                                    <div className="order-details">
                                        <span className="order-id">Order #{order.order_id}</span>
                                        <span className="order-date">{order.order_date}</span>
                                        <span className={`status-badge status-${order.status.toLowerCase()}`}>{order.status}</span>
                                    </div>
                                    <span className="order-total">${order.total.toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderPage;

import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../../AuthProvider";
import { useNavigate } from "react-router-dom";
import "../../css/css.css";
import Header from "../includes/header";

const InventoryPage = () => {
    const [inventory, setInventory] = useState([]);
    const [newItem, setNewItem] = useState({ item_name: "", no_in_stock: 0 });
    const [editingItem, setEditingItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [stockFilter, setStockFilter] = useState("all"); // all, low, out

    const { token, user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            navigate("/login");
        }
    }, [token, navigate]);

    // Fetch inventory items
    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:5000/inventory", {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            setInventory(response.data);
        } catch (error) {
            console.error("Error fetching inventory:", error);
        } finally {
            setLoading(false);
        }
    };
    
    // Sort inventory items
    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };
    
    // Filter inventory items
    const getFilteredInventory = () => {
        let filteredItems = [...inventory];
        
        // Apply search filter
        if (searchTerm) {
            filteredItems = filteredItems.filter(item => 
                item.item_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Apply stock filter
        if (stockFilter === 'low') {
            filteredItems = filteredItems.filter(item => item.no_in_stock > 0 && item.no_in_stock <= 10);
        } else if (stockFilter === 'out') {
            filteredItems = filteredItems.filter(item => item.no_in_stock === 0);
        }
        
        // Apply sort
        if (sortConfig.key) {
            filteredItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        
        return filteredItems;
    };

    // Handle adding new item
    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!newItem.item_name.trim()) {
            alert("Please enter an item name");
            return;
        }
        
        setLoading(true);
        try {
            await axios.post("http://localhost:5000/inventory", newItem, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            setNewItem({ item_name: "", no_in_stock: 0 });
            fetchInventory(); // Refresh list
        } catch (error) {
            console.error("Error adding item:", error);
            alert("Failed to add item. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Handle editing an item
    const handleEditItem = async () => {
        setLoading(true);
        try {
            await axios.put(`http://localhost:5000/inventory/${editingItem.inventory_id}`, editingItem, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            setEditingItem(null);
            fetchInventory(); // Refresh list
        } catch (error) {
            console.error("Error updating item:", error);
            alert("Failed to update item. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Handle deleting an item
    const handleDeleteItem = async (id, itemName) => {
        if (!window.confirm(`Are you sure you want to delete "${itemName}"?`)) {
            return;
        }
        
        setLoading(true);
        try {
            await axios.delete(`http://localhost:5000/inventory/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            fetchInventory(); // Refresh list
        } catch (error) {
            console.error("Error deleting item:", error);
            alert("Failed to delete item. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    
    // Cancel editing
    const handleCancelEdit = () => {
        setEditingItem(null);
    };

    return (
        <div className="inventory-container">
            <Header/>
            <div className="container">
                <h1 className="page-title">Inventory Management</h1>
                
                <div className="inventory-content">
                    <div className="inventory-sidebar">
                        {/* Add Item Form */}
                        <div className="form-container">
                            <h2 className="section-title">Add New Item</h2>
                            <form onSubmit={handleAddItem} className="inventory-form">
                                <div className="form-group">
                                    <label>Item Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter item name"
                                        value={newItem.item_name}
                                        onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
                                        className="form-input"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Initial Stock Quantity</label>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="Enter quantity"
                                        value={newItem.no_in_stock}
                                        onChange={(e) => setNewItem({ ...newItem, no_in_stock: Number(e.target.value) })}
                                        className="form-input"
                                        required
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    className="add-item-button" 
                                    disabled={loading || !newItem.item_name.trim()}
                                >
                                    {loading ? "Adding..." : "Add Item"}
                                </button>
                            </form>
                        </div>
                        
                        {/* Filters */}
                        <div className="form-container">
                            <h2 className="section-title">Filters</h2>
                            <div className="filter-form">
                                <div className="form-group">
                                    <label>Search Items</label>
                                    <input
                                        type="text"
                                        placeholder="Search by name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Filter by Stock</label>
                                    <select 
                                        value={stockFilter} 
                                        onChange={(e) => setStockFilter(e.target.value)}
                                        className="form-select"
                                    >
                                        <option value="all">All Items</option>
                                        <option value="low">Low Stock (≤ 10)</option>
                                        <option value="out">Out of Stock</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        {/* Stats Card */}
                        <div className="stats-card">
                            <div className="stat-item">
                                <div className="stat-label">Total Items</div>
                                <div className="stat-value">{inventory.length}</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-label">Low Stock</div>
                                <div className="stat-value">
                                    {inventory.filter(item => item.no_in_stock > 0 && item.no_in_stock <= 10).length}
                                </div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-label">Out of Stock</div>
                                <div className="stat-value">
                                    {inventory.filter(item => item.no_in_stock === 0).length}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="inventory-main">
                        <div className="table-container">
                            <h2 className="section-title">Inventory Items</h2>
                            
                            {loading ? (
                                <div className="loading-spinner">Loading inventory data...</div>
                            ) : getFilteredInventory().length === 0 ? (
                                <div className="empty-state">
                                    <p>No inventory items found matching your criteria.</p>
                                </div>
                            ) : (
                                <table className="inventory-table">
                                    <thead>
                                        <tr>
                                            <th onClick={() => requestSort('item_name')} className="sortable-header">
                                                Item Name
                                                {sortConfig.key === 'item_name' && (
                                                    <span className="sort-indicator">
                                                        {sortConfig.direction === 'ascending' ? '▲' : '▼'}
                                                    </span>
                                                )}
                                            </th>
                                            <th onClick={() => requestSort('no_in_stock')} className="sortable-header">
                                                Stock
                                                {sortConfig.key === 'no_in_stock' && (
                                                    <span className="sort-indicator">
                                                        {sortConfig.direction === 'ascending' ? '▲' : '▼'}
                                                    </span>
                                                )}
                                            </th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getFilteredInventory().map((item) => (
                                            <tr key={item.inventory_id} className={item.no_in_stock === 0 ? 'out-of-stock' : item.no_in_stock <= 10 ? 'low-stock' : ''}>
                                                <td>
                                                    {editingItem?.inventory_id === item.inventory_id ? (
                                                        <input
                                                            type="text"
                                                            value={editingItem.item_name}
                                                            onChange={(e) => setEditingItem({ ...editingItem, item_name: e.target.value })}
                                                            className="form-input"
                                                        />
                                                    ) : (
                                                        item.item_name
                                                    )}
                                                </td>
                                                <td className={item.no_in_stock === 0 ? 'stock-out' : item.no_in_stock <= 10 ? 'stock-low' : ''}>
                                                    {editingItem?.inventory_id === item.inventory_id ? (
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={editingItem.no_in_stock}
                                                            onChange={(e) => setEditingItem({ ...editingItem, no_in_stock: Number(e.target.value) })}
                                                            className="form-input"
                                                        />
                                                    ) : (
                                                        <>
                                                            {item.no_in_stock}
                                                            {item.no_in_stock === 0 && <span className="stock-badge out">Out of Stock</span>}
                                                            {item.no_in_stock > 0 && item.no_in_stock <= 10 && <span className="stock-badge low">Low Stock</span>}
                                                        </>
                                                    )}
                                                </td>
                                                <td>
                                                    {editingItem?.inventory_id === item.inventory_id ? (
                                                        <div className="action-buttons">
                                                            <button onClick={handleEditItem} className="save-button" disabled={loading}>
                                                                {loading ? "Saving..." : "Save"}
                                                            </button>
                                                            <button onClick={handleCancelEdit} className="cancel-button">
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="action-buttons">
                                                            <button 
                                                                onClick={() => setEditingItem(item)} 
                                                                className="edit-button"
                                                                disabled={loading}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteItem(item.inventory_id, item.item_name)} 
                                                                className="delete-button"
                                                                disabled={loading}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InventoryPage;

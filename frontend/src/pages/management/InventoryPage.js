import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../../AuthProvider";
import { useNavigate } from "react-router-dom";
import "../../css/css.css";
import Header from "../includes/header"; // Add your custom CSS file

const InventoryPage = () => {
    const [inventory, setInventory] = useState([]);
    const [newItem, setNewItem] = useState({ item_name: "", no_in_stock: 0 });
    const [editingItem, setEditingItem] = useState(null);

    const { token, user, logout } = useContext(AuthContext);
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
        try {
            const response = await axios.get("http://localhost:5001/inventory");
            setInventory(response.data);
        } catch (error) {
            console.error("Error fetching inventory:", error);
        }
    };

    // Handle adding new item
    const handleAddItem = async () => {
        try {
            await axios.post("http://localhost:5001/inventory", newItem);
            setNewItem({ item_name: "", no_in_stock: 0 });
            fetchInventory(); // Refresh list
        } catch (error) {
            console.error("Error adding item:", error);
        }
    };

    // Handle editing an item
    const handleEditItem = async () => {
        try {
            await axios.put(`http://localhost:5001/inventory/${editingItem.inventory_id}`, editingItem);
            setEditingItem(null);
            fetchInventory(); // Refresh list
        } catch (error) {
            console.error("Error updating item:", error);
        }
    };

    // Handle deleting an item
    const handleDeleteItem = async (id) => {
        try {
            await axios.delete(`http://localhost:5001/inventory/${id}`);
            fetchInventory(); // Refresh list
        } catch (error) {
            console.error("Error deleting item:", error);
        }
    };

    return (
        <div className="inventory-container">
            <Header/>
            <h2>Inventory</h2>

            {/* Add Item */}
            <div className="add-item-form">
                <h3>Add Item</h3>
                <input
                    type="text"
                    placeholder="Item Name"
                    value={newItem.item_name}
                    onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
                    className="input-field"
                />
                <input
                    type="number"
                    placeholder="Stock Quantity"
                    value={newItem.no_in_stock}
                    onChange={(e) => setNewItem({ ...newItem, no_in_stock: Number(e.target.value) })}
                    className="input-field"
                />
                <button onClick={handleAddItem} className="add-item-button">Add</button>
            </div>

            {/* Inventory Table */}
            <table className="inventory-table">
                <thead>
                <tr>
                    <th>Item Name</th>
                    <th>Stock</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {inventory.map((item) => (
                    <tr key={item.inventory_id}>
                        <td>
                            {editingItem?.inventory_id === item.inventory_id ? (
                                <input
                                    type="text"
                                    value={editingItem.item_name}
                                    onChange={(e) => setEditingItem({ ...editingItem, item_name: e.target.value })}
                                    className="input-field"
                                />
                            ) : (
                                item.item_name
                            )}
                        </td>
                        <td>
                            {editingItem?.inventory_id === item.inventory_id ? (
                                <input
                                    type="number"
                                    value={editingItem.no_in_stock}
                                    onChange={(e) => setEditingItem({ ...editingItem, no_in_stock: Number(e.target.value) })}
                                    className="input-field"
                                />
                            ) : (
                                item.no_in_stock
                            )}
                        </td>
                        <td>
                            {editingItem?.inventory_id === item.inventory_id ? (
                                <button onClick={handleEditItem} className="edit-button">Save</button>
                            ) : (
                                <>
                                    <button onClick={() => setEditingItem(item)} className="edit-button">Edit</button>
                                    <button onClick={() => handleDeleteItem(item.inventory_id)} className="delete-button">Delete</button>
                                </>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default InventoryPage;

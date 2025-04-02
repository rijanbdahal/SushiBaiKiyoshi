import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../../css/css.css";
import Header from "../includes/header"; // Add your custom CSS file

const MenuItems = () => {
    const [inventoryItems, setInventoryItems] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [inventoryId, setInventoryId] = useState('');
    const [menuItemName, setMenuItemName] = useState('');
    const [description, setDescription] = useState('');
    const [availability, setAvailability] = useState(false);
    const [price, setPrice] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchInventory();
        fetchMenuItems();
    }, []);

    const fetchInventory = async () => {
        try {
            const response = await axios.get('http://localhost:5000/menuitems/inventory');
            setInventoryItems(response.data);
        } catch (error) {
            console.error('Error fetching inventory:', error);
        }
    };

    const fetchMenuItems = async () => {
        try {
            const response = await axios.get('http://localhost:5000/menuitems');
            setMenuItems(response.data);
        } catch (error) {
            console.error('Error fetching menu items:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingItem) {
                await axios.put(`http://localhost:5000/menuitems/${editingItem.menu_item_id}`, {
                    inventory_id: inventoryId,
                    menu_item_name: menuItemName,
                    description,
                    availability,
                    price: parseFloat(price),
                });
                setMessage('Menu item updated successfully!');
            } else {
                const response = await axios.post('http://localhost:5000/menuitems', {
                    inventory_id: inventoryId,
                    menu_item_name: menuItemName,
                    description,
                    availability,
                    price: parseFloat(price),
                });
                setMessage(`Menu item created successfully! ID: ${response.data.menuItemId}`);
            }
            resetForm();
            fetchMenuItems();
        } catch (error) {
            console.error('Error saving menu item:', error);
            setMessage('Failed to save menu item.');
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setInventoryId(item.inventory_id);
        setMenuItemName(item.menu_item_name);
        setDescription(item.description);
        setAvailability(item.availability);
        setPrice(item.price);
    };

    const resetForm = () => {
        setEditingItem(null);
        setInventoryId('');
        setMenuItemName('');
        setDescription('');
        setAvailability(false);
        setPrice('');
    };

    return (
        <div className="menu-items-container">
            <Header/>
            <h1 className="page-title">{editingItem ? 'Edit Menu Item' : 'Create Menu Item'}</h1>
            <form onSubmit={handleSubmit} className="menu-item-form">
                <div className="form-section">
                    <label>Inventory:</label>
                    <select value={inventoryId} onChange={(e) => setInventoryId(e.target.value)} required className="form-input">
                        <option value="">Select Inventory Item</option>
                        {inventoryItems.map((item) => (
                            <option key={item.inventory_id} value={item.inventory_id}>
                                {item.item_name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-section">
                    <label>Menu Item Name:</label>
                    <input
                        type="text"
                        value={menuItemName}
                        onChange={(e) => setMenuItemName(e.target.value)}
                        required
                        className="form-input"
                    />
                </div>
                <div className="form-section">
                    <label>Description:</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="form-input"
                    />
                </div>
                <div className="form-section">
                    <label>Availability:</label>
                    <input
                        type="checkbox"
                        checked={availability}
                        onChange={(e) => setAvailability(e.target.checked)}
                        className="form-checkbox"
                    />
                </div>
                <div className="form-section">
                    <label>Price:</label>
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                        className="form-input"
                    />
                </div>
                <button type="submit" className="submit-button">{editingItem ? 'Update' : 'Create'} Menu Item</button>
                {editingItem && <button type="button" onClick={resetForm} className="cancel-button">Cancel</button>}
            </form>
            {message && <p className="message">{message}</p>}

            <h2 className="menu-items-list-title">Menu Items</h2>
            <table className="menu-items-table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Inventory ID</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Availability</th>
                    <th>Price</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {menuItems.map((item) => (
                    <tr key={item.menu_item_id}>
                        <td>{item.menu_item_id}</td>
                        <td>{item.inventory_id}</td>
                        <td>{item.menu_item_name}</td>
                        <td>{item.description}</td>
                        <td>{item.availability ? 'Yes' : 'No'}</td>
                        <td>${item.price.toFixed(2)}</td>
                        <td>
                            <button onClick={() => handleEdit(item)} className="edit-button">Edit</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default MenuItems;

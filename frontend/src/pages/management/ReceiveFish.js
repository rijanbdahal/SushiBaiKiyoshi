import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../css/css.css";
import Header from "../includes/header"; // Add your custom CSS file

const ReceiveFish = () => {
    const [inventory, setInventory] = useState([]);
    const [receivedFish, setReceivedFish] = useState([]);
    const [selectedFish, setSelectedFish] = useState("");
    const [newFish, setNewFish] = useState("");
    const [quantity, setQuantity] = useState("");
    const [marketName, setMarketName] = useState("");
    const [fishPrice, setFishPrice] = useState("");
    const [postalCode, setPostalCode] = useState("");

    useEffect(() => {
        fetchInventory();
        fetchReceivedFish();
    }, []);

    const fetchInventory = async () => {
        try {
            const response = await axios.get("http://localhost:5000/receivefish/getInventory");
            setInventory(response.data);
        } catch (error) {
            console.error("Error fetching inventory:", error);
        }
    };

    const fetchReceivedFish = async () => {
        try {
            const response = await axios.get("http://localhost:5000/receivefish/getReceivedFish");
            setReceivedFish(response.data);
        } catch (error) {
            console.error("Error fetching received fish entries:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFish && !newFish) {
            alert("Please select or enter a fish name.");
            return;
        }
        if (!quantity || isNaN(quantity) || quantity <= 0) {
            alert("Please enter a valid quantity.");
            return;
        }
        if (!marketName || !fishPrice || !postalCode) {
            alert("Please enter all market details.");
            return;
        }

        const payload = {
            item_name: selectedFish || newFish,
            quantity: parseInt(quantity),
            market_name: marketName,
            fish_price: parseFloat(fishPrice),
            postal_code: postalCode
        };

        try {
            await axios.post("http://localhost:5000/receivefish", payload);
            alert("Inventory updated successfully.");
            setSelectedFish("");
            setNewFish("");
            setQuantity("");
            setMarketName("");
            setFishPrice("");
            setPostalCode("");
            fetchReceivedFish(); // Refresh received fish list
        } catch (error) {
            console.error("Error updating inventory:", error);
            alert("Failed to update inventory.");
        }
    };

    return (
        <div className="receive-fish-container">
            <Header/>
            <h2>Receiving Inventory</h2>
            <form onSubmit={handleSubmit} className="receive-fish-form">
                <div className="form-group">
                    <label>Select Fish:</label>
                    <select value={selectedFish} onChange={(e) => { setSelectedFish(e.target.value); setNewFish(""); }} className="input-field">
                        <option value="">-- Choose Existing Fish --</option>
                        {inventory.map((fish) => (
                            <option key={fish.inventory_id} value={fish.item_name}>
                                {fish.item_name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Or Enter New Fish Name:</label>
                    <input type="text" value={newFish} onChange={(e) => { setNewFish(e.target.value); setSelectedFish(""); }} placeholder="Enter new fish name" className="input-field" />
                </div>

                <div className="form-group">
                    <label>Quantity Received:</label>
                    <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Enter quantity" className="input-field" />
                </div>

                <div className="form-group">
                    <label>Market Name:</label>
                    <input type="text" value={marketName} onChange={(e) => setMarketName(e.target.value)} placeholder="Enter market name" className="input-field" />
                </div>

                <div className="form-group">
                    <label>Fish Price:</label>
                    <input type="number" step="0.01" value={fishPrice} onChange={(e) => setFishPrice(e.target.value)} placeholder="Enter fish price" className="input-field" />
                </div>

                <div className="form-group">
                    <label>Postal Code:</label>
                    <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="Enter postal code" className="input-field" />
                </div>

                <button type="submit" className="submit-button">Submit</button>
            </form>

            <h2>Received Fish Entries</h2>
            <table className="received-fish-table">
                <thead>
                <tr>
                    <th>Market ID</th>
                    <th>Fish Name</th>
                    <th>Market Name</th>
                    <th>Fish Price</th>
                    <th>Postal Code</th>
                    <th>Stock</th>
                </tr>
                </thead>
                <tbody>
                {receivedFish.map((entry) => (
                    <tr key={entry.market_id}>
                        <td>{entry.market_id}</td>
                        <td>{entry.item_name}</td>
                        <td>{entry.market_name}</td>
                        <td>${entry.fish_price}</td>
                        <td>{entry.postal_code}</td>
                        <td>{entry.inbound_quantity}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default ReceiveFish;

import React, { useState } from 'react';
import axios from 'axios';
import "../../css/css.css";
import Header from "../includes/header"; // Add your custom CSS file

const App = () => {
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('');
    const [province, setProvince] = useState('');
    const [city, setCity] = useState('');
    const [streetAddress, setStreetAddress] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5001/supplieraddress', {
                postal_code: postalCode,
                country: country,
                province: province,
                city: city,
                street_address: streetAddress
            });
            alert(response.data.message);
        } catch (error) {
            console.error(error);
            alert('There was an error adding the address');
        }
    };

    return (
        <div className="address-container">
            <Header/>
            <h1 className="page-title">Enter Address Details</h1>
            <form onSubmit={handleSubmit} className="address-form">
                <div className="form-section">
                    <label>Postal Code</label>
                    <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="form-input"
                    />
                </div>
                <div className="form-section">
                    <label>Postal Code</label>
                    <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="form-input"
                    />
                </div>
                <div className="form-section">
                    <label>Country</label>
                    <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="form-input"
                    />
                </div>
                <div className="form-section">
                    <label>Province</label>
                    <input
                        type="text"
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        className="form-input"
                    />
                </div>
                <div className="form-section">
                    <label>City</label>
                    <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="form-input"
                    />
                </div>
                <div className="form-section">
                    <label>Street Address</label>
                    <input
                        type="text"
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        className="form-input"
                    />
                </div>
                <button type="submit" className="submit-button">Submit</button>
            </form>
        </div>
    );
};

export default App;

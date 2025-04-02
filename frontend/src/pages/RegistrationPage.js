import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../css/css.css'; // Ensure the CSS file is imported

const RegistrationPage = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [userType, setUserType] = useState("");
    const navigate = useNavigate();
    // Address fields
    const [postalCode, setPostalCode] = useState("");
    const [country, setCountry] = useState("");
    const [province, setProvince] = useState("");
    const [city, setCity] = useState("");
    const [streetAddress, setStreetAddress] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        try {
            const response = await axios.post("http://localhost:5000/registerUser", {
                firstName,
                lastName,
                email,
                password,
                phoneNumber,
                userType,
                postalCode,
                country,
                province,
                city,
                streetAddress
            });

            setMessage(response?.data?.message);
            setError("");
            navigate("/login");
        } catch (err) {
            setError(err.message || "Registration failed");
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Register</h2>
                {message && <p className="message">{message}</p>}
                {error && <p className="error">{error}</p>}

                <div>
                    <label>First Name:</label>
                    <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>Last Name:</label>
                    <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>Phone Number:</label>
                    <input
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>User Type:</label>
                    <select
                        value={userType}
                        onChange={(e) => setUserType(e.target.value)}
                        required
                    >
                        <option value="">Select User Type</option>
                        <option value="A">Admin</option>
                        <option value="U">User</option>
                    </select>
                </div>

                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>Confirm Password:</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>

                {/* Address Fields */}
                <div>
                    <label>Postal Code:</label>
                    <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>Country:</label>
                    <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>Province:</label>
                    <input
                        type="text"
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>City:</label>
                    <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>Street Address:</label>
                    <input
                        type="text"
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        required
                    />
                </div>

                <button type="submit">Register</button>
                <a href="/login" style={{color:"black"}}>Already Registered?</a>
            </form>
        </div>
    );
};

export default RegistrationPage;

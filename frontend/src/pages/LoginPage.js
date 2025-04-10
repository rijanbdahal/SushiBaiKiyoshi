import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../AuthProvider";
import { useNavigate } from "react-router-dom";
import "../css/css.css";

const LoginPage = () => {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const authenticateLogin = async (e) => {
        e.preventDefault();
        try {
            // Use port 5000 as specified in your .env file
            console.log("Attempting login with:", { email, password });

            const response = await axios.post("http://localhost:5000/loginPage/authenticateUser", {
                email: email,
                password: password,
            });

            console.log("Login response:", response.data);

            const { token, user } = response.data;
            if (token && user) {
                login(token, user);
                navigate("/dashboard");
            }
        } catch (err) {
            console.error("Login error:", err);

            // More detailed error message
            if (err.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                setError(`Login failed: ${err.response.data.message || err.response.statusText}`);
            } else if (err.request) {
                // The request was made but no response was received
                setError("No response from server. Please check your connection.");
            } else {
                // Something happened in setting up the request that triggered an Error
                setError(`Error: ${err.message}`);
            }
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={authenticateLogin}>
                <h2>Login</h2>
                <label>Email:</label>
                <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <label>Password:</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Login</button>

                {error && <p className="error-message">{error}</p>}
                <a href="/register" style={{color:"black"}}>Need To Register?</a>
            </form>
        </div>
    );
};

export default LoginPage;
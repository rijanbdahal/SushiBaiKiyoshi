import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../AuthProvider";
import { useNavigate } from "react-router-dom";
import "../css/css.css";

const LoginPage = () => {
    const { login } = useContext(AuthContext);
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const authenticateLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:5000/loginPage/authenticateUser", {
                userId: userId,
                password: password,
            });

            const { token, user } = response.data;
            if (token && user) {
                login(token, user);
                navigate("/dashboard");
            }
        } catch (err) {
            console.log(err);
            setError("Problem Logging In");
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={authenticateLogin}>
                <h2>Login</h2>
                <label>User ID:</label>
                <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
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

                {error && <p>{error}</p>}
                <a href="/register" style={{color:"black"}}>Need To Register?</a>
            </form>

        </div>
    );
};

export default LoginPage;

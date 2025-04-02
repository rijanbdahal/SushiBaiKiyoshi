import React, { useContext, useEffect } from "react";
import { AuthContext } from "../AuthProvider";
import { useNavigate } from "react-router-dom";
import Header from "./includes/header";
import '../css/css.css'

const Dashboard = () => {
    const { token, user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            navigate("/login");
        }
    }, [token, navigate]);

    return (
        <div className="dashboard-container">
            <Header />
            <h1>Dashboard</h1>
            {token ? (
                <div>
                    <h2>Hi, welcome to our website, {user?.first_name}!</h2>
                    <button onClick={logout}>Logout</button>

                </div>
            ) : (
                <p className="unauthenticated-message">You are not logged in.</p>
            )}
        </div>
    );
};

export default Dashboard;

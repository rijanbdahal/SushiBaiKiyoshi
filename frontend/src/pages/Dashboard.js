import React, { useContext, useEffect } from "react";
import { AuthContext } from "../AuthProvider";
import { useNavigate } from "react-router-dom";
import CustomerDashboard from "./client/CustomerDashboard";
import AdminDashboard from "./management/AdminDashboard";
import Header from "./includes/header";
import '../css/css.css';

const Dashboard = () => {
    const { token, user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }
    }, [token, navigate]);

    if (!user) {
        return (
            <div className="dashboard-container">
                <Header />
                <div className="container">
                    <div className="loading-spinner">Loading dashboard...</div>
                </div>
            </div>
        );
    }

    // Render different dashboard based on user type
    return user.user_type === "A" ? <AdminDashboard /> : <CustomerDashboard />;
};

export default Dashboard;

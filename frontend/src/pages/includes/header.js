import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../../css/css.css';
import { AuthContext } from "../../AuthProvider";

const Header = () => {
    const { token, user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [expandedSections, setExpandedSections] = useState({});
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!token) {
            navigate("/login");
        }
    }, [token, navigate]);

    const toggleSection = (section) => {
        setExpandedSections({
            ...expandedSections,
            [section]: !expandedSections[section]
        });
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <header className="header">
            <div className="logo">
                <Link to="/dashboard">
                    <img src="../../logo.png" alt="Logo" className="logo-img" />
                </Link>
            </div>

            <div className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <span className="toggle-icon"></span>
            </div>

            <nav className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
                {/* Main Navigation - High Priority Items */}
                <div className="nav-section primary-nav">
                    <ul>
                        <li><Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>
                            <i className="nav-icon dashboard-icon"></i>Dashboard
                        </Link></li>

                        {/* Show Place Order only for non-admin users */}
                        {user?.user_type !== 'A' && (
                            <li><Link to="/placeorder" className={isActive('/placeorder') ? 'active' : ''}>
                                <i className="nav-icon order-icon"></i>Place Order
                            </Link></li>
                        )}

                        {user?.user_type === 'A' && (
                            <>
                                <li><Link to="/vieworder" className={isActive('/vieworder') ? 'active' : ''}>
                                    <i className="nav-icon view-orders-icon"></i>View Orders
                                </Link></li>
                                <li><Link to="/inventory" className={isActive('/inventory') ? 'active' : ''}>
                                    <i className="nav-icon inventory-icon"></i>Inventory
                                </Link></li>
                                <li><Link to="/analytics" className={isActive('/analytics') ? 'active' : ''}>
                                    <i className="nav-icon analytics-icon"></i>Analytics
                                </Link></li>
                            </>
                        )}
                    </ul>
                </div>

                {/* Account Section */}
                <div className="nav-section collapsible">
                    <div
                        className={`section-header ${expandedSections.account ? 'expanded' : ''}`}
                        onClick={() => toggleSection('account')}
                    >
                        <span>Account</span>
                        <i className="toggle-icon"></i>
                    </div>

                    <ul className={`submenu ${expandedSections.account ? 'expanded' : ''}`}>
                        <li><Link to="/viewprofile" className={isActive('/viewprofile') ? 'active' : ''}>
                            <i className="nav-icon profile-icon"></i>Profile
                        </Link></li>
                        <li><Link to="/carddetails" className={isActive('/carddetails') ? 'active' : ''}>
                            <i className="nav-icon card-icon"></i>Card Details
                        </Link></li>
                    </ul>
                </div>

                {/* Admin Tools Section - Only for admin users */}
                {user?.user_type === 'A' && (
                    <div className="nav-section collapsible">
                        <div
                            className={`section-header ${expandedSections.adminTools ? 'expanded' : ''}`}
                            onClick={() => toggleSection('adminTools')}
                        >
                            <span>Admin Tools</span>
                            <i className="toggle-icon"></i>
                        </div>

                        <ul className={`submenu ${expandedSections.adminTools ? 'expanded' : ''}`}>
                            <li><Link to="/receivefish" className={isActive('/receivefish') ? 'active' : ''}>
                                <i className="nav-icon receive-icon"></i>Receiving
                            </Link></li>
                            <li><Link to="/addsupplieraddress" className={isActive('/addsupplieraddress') ? 'active' : ''}>
                                <i className="nav-icon supplier-icon"></i>Add Supplier
                            </Link></li>
                            <li><Link to="/addmenuitems" className={isActive('/addmenuitems') ? 'active' : ''}>
                                <i className="nav-icon menu-icon"></i>Add Menu Items
                            </Link></li>
                            <li><Link to="/edituser" className={isActive('/edituser') ? 'active' : ''}>
                                <i className="nav-icon user-icon"></i>Edit User
                            </Link></li>
                        </ul>
                    </div>
                )}

                {/* Logout Button */}
                <div className="nav-section logout-section">
                    <button className="logout-button" onClick={logout}>
                        <i className="nav-icon logout-icon"></i>
                        Logout
                    </button>
                </div>
            </nav>
        </header>
    );
};

export default Header;
import React, { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../css/css.css';
import { AuthContext } from "../../AuthProvider";

const Header = () => {
    const { token, user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            navigate("/login");
        }
    }, [token, navigate]);

    return (
        <header className="header">
            <div className="logo">
                <Link to="/dashboard">
                    <img src="../../logo.png" alt="Logo" className="logo-img" />
                </Link>
            </div>
            <nav className="nav-links">
                <ul>
                    <li><Link to="/dashboard">Dashboard</Link></li>
                    <li><Link to="/placeorder">Place Order</Link></li>
                    <li><Link to="/carddetails">Card Details</Link></li>
                    <li><Link to="/viewprofile">Profile</Link></li>



                    {/* Admin-specific links */}
                    {user?.user_type === 'A' && (
                        <>
                            <li><Link to="/inventory">Inventory</Link></li>
                            <li><Link to="/receivefish">Receiving</Link></li>
                            <li><Link to="/addsupplieraddress">Add Supplier Address</Link></li>
                            <li><Link to="/addmenuitems">Add Menu Items</Link></li>
                            <li><Link to="/vieworder">View Orders</Link></li>
                            <li><Link to="/edituser">Edit User</Link></li>
                        </>
                    )}


                </ul>
            </nav>
        </header>
    );
};

export default Header;

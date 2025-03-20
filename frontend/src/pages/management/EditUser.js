import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../../css/css.css";
import Header from "../includes/header"; // Add your custom CSS file

const ManageUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [editUser, setEditUser] = useState({
        user_id: null,
        first_name: '',
        last_name: '',
        phone_number: '',
        email_address: '',
        user_type: '',
        address_id: ''
    });
    const [loading, setLoading] = useState(false);

    // Fetch all users
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const response = await axios.get('http://localhost:5000/users/getUsers');
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Handle edit user
    const handleEditUser = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.put(`http://localhost:5000/users/editUser/${editUser.user_id}`, editUser);
            alert(response.data.message);
            setUsers(users.map(user => (user.user_id === editUser.user_id ? editUser : user)));
            setEditUser({
                user_id: null,
                first_name: '',
                last_name: '',
                phone_number: '',
                email_address: '',
                user_type: '',
                address_id: ''
            });
        } catch (error) {
            console.error('Error editing user:', error);
            alert('Failed to edit user.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (user_id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            setLoading(true);

            try {
                const response = await axios.delete(`http://localhost:5000/users/deleteUser/${user_id}`);
                alert(response.data.message);
                setUsers(users.filter(user => user.user_id !== user_id));
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Failed to delete user.');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="manage-users-container">
            <Header/>
            <h1 className="page-title">Manage Users</h1>

            <h2>Edit User</h2>
            <form onSubmit={handleEditUser} className="user-form">
                <select
                    onChange={(e) => {
                        const user = users.find(user => user.user_id === parseInt(e.target.value));
                        setEditUser(user || {
                            user_id: null,
                            first_name: '',
                            last_name: '',
                            phone_number: '',
                            email_address: '',
                            user_type: '',
                            address_id: ''
                        });
                    }}
                    value={editUser.user_id || ''}
                    className="form-select"
                >
                    <option value="">Select User to Edit</option>
                    {users.map((user) => (
                        <option key={user.user_id} value={user.user_id}>
                            {user.first_name} {user.last_name}
                        </option>
                    ))}
                </select>

                {editUser.user_id && (
                    <>
                        <input
                            type="text"
                            placeholder="First Name"
                            value={editUser.first_name}
                            onChange={(e) => setEditUser({ ...editUser, first_name: e.target.value })}
                            required
                            className="form-input"
                        />
                        <input
                            type="text"
                            placeholder="Last Name"
                            value={editUser.last_name}
                            onChange={(e) => setEditUser({ ...editUser, last_name: e.target.value })}
                            required
                            className="form-input"
                        />
                        <input
                            type="text"
                            placeholder="Phone Number"
                            value={editUser.phone_number}
                            onChange={(e) => setEditUser({ ...editUser, phone_number: e.target.value })}
                            required
                            className="form-input"
                        />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={editUser.email_address}
                            onChange={(e) => setEditUser({ ...editUser, email_address: e.target.value })}
                            required
                            className="form-input"
                        />
                        <select
                            value={editUser.user_type}
                            onChange={(e) => setEditUser({ ...editUser, user_type: e.target.value })}
                            required
                            className="form-select"
                        >
                            <option value="">Select User Type</option>
                            <option value="CU">Customer</option>
                            <option value="EM">Employee</option>
                        </select>
                        <input
                            type="number"
                            placeholder="Address ID"
                            value={editUser.address_id}
                            onChange={(e) => setEditUser({ ...editUser, address_id: e.target.value })}
                            required
                            className="form-input"
                        />
                        <button type="submit" disabled={loading} className="submit-button">
                            {loading ? 'Editing...' : 'Edit User'}
                        </button>
                    </>
                )}
            </form>

            <h2>Existing Users</h2>
            <ul className="user-list">
                {users.map((user) => (
                    <li key={user.user_id} className="user-item">
                        {user.first_name} {user.last_name} - {user.user_type} - {user.email_address}
                        <button onClick={() => handleDeleteUser(user.user_id)} disabled={loading} className="delete-button">
                            {loading ? 'Deleting...' : 'Delete'}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ManageUsersPage;

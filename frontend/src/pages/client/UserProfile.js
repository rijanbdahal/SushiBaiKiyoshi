import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../AuthProvider';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Header from "../includes/header";

const ProfilePage = () => {
    const { token } = useContext(AuthContext);
    const [userProfile, setUserProfile] = useState(null);
    const [updatedUser, setUpdatedUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchUserProfile = async () => {
            try {
                const decodedToken = jwtDecode(token);
                const userId = decodedToken.userId;

                // Fetch the user profile from the server using the userId
                const response = await axios.get(`http://localhost:5000/profile/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const userData = response.data;
                setUserProfile(userData);
                setUpdatedUser(userData);
            } catch (error) {
                console.error('Error fetching user profile:', error);
                if (error.response?.status === 401) {
                    navigate('/login');
                }
            }
        };

        fetchUserProfile();
    }, [token, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUpdatedUser((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        try {
            const response = await axios.put(
                'http://localhost:5000/profile',
                updatedUser,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setUserProfile(response.data);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    if (!userProfile) {
        return <p>Loading profile...</p>;
    }

    return (
        <div className="profile-page">
            <Header />
            <h1>Profile Page</h1>
            <div className="profile-info">
                {[
                    { label: "First Name", key: "first_name" },
                    { label: "Last Name", key: "last_name" },
                    { label: "Email Address", key: "email_address" },
                    { label: "Phone Number", key: "phone_number" },
                    { label: "Street Address", key: "street_address" },
                    { label: "City", key: "city" },
                    { label: "Province", key: "province" },
                    { label: "Country", key: "country" },
                    { label: "Postal Code", key: "postal_code" },
                ].map(({ label, key }) => (
                    <div key={key}>
                        <label>{label}:</label>
                        {isEditing ? (
                            <input
                                type="text"
                                name={key}
                                value={updatedUser?.[key] || ""}
                                onChange={handleChange}
                            />
                        ) : (
                            <p>{userProfile?.[key]}</p>
                        )}
                    </div>
                ))}

                <div>
                    {isEditing ? (
                        <button onClick={handleSave}>Save</button>
                    ) : (
                        <button onClick={() => setIsEditing(true)}>Edit Profile</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;

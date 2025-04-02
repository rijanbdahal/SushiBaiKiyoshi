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
            // Prepare address data to match backend expectations
            const profileData = {
                first_name: updatedUser.first_name,
                last_name: updatedUser.last_name,
                phone_number: updatedUser.phone_number,
                email_address: updatedUser.email_address,
                address: {
                    street_address: updatedUser.street_address,
                    city: updatedUser.city,
                    province: updatedUser.province,
                    country: updatedUser.country,
                    postal_code: updatedUser.postal_code
                }
            };

            const response = await axios.put(
                'http://localhost:5000/profile',
                profileData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            
            // Refresh user profile data after successful update
            if (response.data) {
                const decodedToken = jwtDecode(token);
                const userId = decodedToken.userId;
                
                const profileResponse = await axios.get(`http://localhost:5000/profile/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                
                setUserProfile(profileResponse.data);
                setUpdatedUser(profileResponse.data);
            }
            
            setIsEditing(false);
            alert("Profile updated successfully!");
        } catch (error) {
            console.error('Error updating profile:', error);
            alert("Error updating profile. Please try again.");
        }
    };

    if (!userProfile) {
        return <p>Loading profile...</p>;
    }

    return (
        <div className="profile-page">
            <Header />
            <h1 className="page-title">My Profile</h1>
            <div className="container">
                <div className="profile-card">
                    <div className="profile-header">
                        <div className="profile-avatar">
                            {userProfile?.first_name?.[0]}{userProfile?.last_name?.[0]}
                        </div>
                        <div className="profile-title">
                            <h2 className="profile-name">{userProfile?.first_name} {userProfile?.last_name}</h2>
                            <p className="profile-role">{userProfile?.role || "Customer"}</p>
                        </div>
                    </div>

                    <div className="profile-actions">
                        {isEditing ? (
                            <button className="save-button" onClick={handleSave}>
                                Save Changes
                            </button>
                        ) : (
                            <button className="edit-profile-button" onClick={() => setIsEditing(true)}>
                                Edit Profile
                            </button>
                        )}
                    </div>

                    <div className="profile-sections">
                        <div className="profile-section">
                            <h3 className="section-title">Personal Information</h3>
                            <div className="profile-fields">
                                {[
                                    { label: "First Name", key: "first_name" },
                                    { label: "Last Name", key: "last_name" },
                                    { label: "Email Address", key: "email_address" },
                                    { label: "Phone Number", key: "phone_number" },
                                ].map(({ label, key }) => (
                                    <div key={key} className="profile-field">
                                        <div className="field-content">
                                            <label className="field-label">{label}</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    name={key}
                                                    value={updatedUser?.[key] || ""}
                                                    onChange={handleChange}
                                                />
                                            ) : (
                                                <p className="field-value">{userProfile?.[key] || "Not provided"}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="profile-section">
                            <h3 className="section-title">Address Information</h3>
                            <div className="profile-fields">
                                {[
                                    { label: "Street Address", key: "street_address" },
                                    { label: "City", key: "city" },
                                    { label: "Province", key: "province" },
                                    { label: "Country", key: "country" },
                                    { label: "Postal Code", key: "postal_code" },
                                ].map(({ label, key }) => (
                                    <div key={key} className="profile-field">
                                        <div className="field-content">
                                            <label className="field-label">{label}</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    name={key}
                                                    value={updatedUser?.[key] || ""}
                                                    onChange={handleChange}
                                                />
                                            ) : (
                                                <p className="field-value">{userProfile?.[key] || "Not provided"}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;

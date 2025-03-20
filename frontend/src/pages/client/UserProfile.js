import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../AuthProvider';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Header from "../includes/header";


const ProfilePage = () => {
    const { user, token } = useContext(AuthContext);
    const [userProfile, setUserProfile] = useState(null);
    const [updatedUser, setUpdatedUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            navigate('/login');
        }

        const fetchUserProfile = async () => {
            try {
                // Decode the JWT token to extract user info
                const decodedToken = jwtDecode(token);
                const userId = decodedToken.userId;

                // Fetch the user profile from the server using the userId
                const response = await axios.get(`http://localhost:5000/profile/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                // Assuming the response includes user data and address
                setUserProfile(response.data);
                setUpdatedUser({
                    ...response.data,
                    address: {
                        ...response.data.address,
                    },
                });
            } catch (error) {
                console.error('Error fetching user profile:', error);
                if (error.response?.status === 401) {
                    navigate('/login'); // Redirect to login if token is invalid
                }
            }
        };

        if (token) {
            fetchUserProfile();
        }
    }, [token, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.includes('address')) {
            const [field] = name.split('.'); // To split address properties
            setUpdatedUser((prevState) => ({
                ...prevState,
                address: {
                    ...prevState.address,
                    [field]: value,
                },
            }));
        } else {
            setUpdatedUser((prevState) => ({
                ...prevState,
                [name]: value,
            }));
        }
    };

    const handleSave = async () => {
        try {
            const { address, ...restUserData } = updatedUser;

            // Prepare the data to be sent to the server
            const updatedData = {
                ...restUserData,
                address: {
                    ...address,
                },
            };

            const response = await axios.put(
                'http://localhost:5000/profile',
                updatedData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setUserProfile(response.data.user);
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
            <Header/>
            <h1>Profile Page</h1>

            <div className="profile-info">
                <div>
                    <label>First Name:</label>
                    {isEditing ? (
                        <input
                            type="text"
                            name="first_name"
                            value={updatedUser.first_name}
                            onChange={handleChange}
                        />
                    ) : (
                        <p>{userProfile.first_name}</p>
                    )}
                </div>

                <div>
                    <label>Last Name:</label>
                    {isEditing ? (
                        <input
                            type="text"
                            name="last_name"
                            value={updatedUser.last_name}
                            onChange={handleChange}
                        />
                    ) : (
                        <p>{userProfile.last_name}</p>
                    )}
                </div>

                <div>
                    <label>Email Address:</label>
                    {isEditing ? (
                        <input
                            type="email"
                            name="email_address"
                            value={updatedUser.email_address}
                            onChange={handleChange}
                        />
                    ) : (
                        <p>{userProfile.email_address}</p>
                    )}
                </div>

                <div>
                    <label>Phone Number:</label>
                    {isEditing ? (
                        <input
                            type="text"
                            name="phone_number"
                            value={updatedUser.phone_number}
                            onChange={handleChange}
                        />
                    ) : (
                        <p>{userProfile.phone_number}</p>
                    )}
                </div>

                <div>
                    <label>Street Address:</label>
                    {isEditing ? (
                        <input
                            type="text"
                            name="address.street_address"
                            value={updatedUser.address.street_address}
                            onChange={handleChange}
                        />
                    ) : (
                        <p>{userProfile.address.street_address}</p>
                    )}
                </div>

                <div>
                    <label>City:</label>
                    {isEditing ? (
                        <input
                            type="text"
                            name="address.city"
                            value={updatedUser.address.city}
                            onChange={handleChange}
                        />
                    ) : (
                        <p>{userProfile.address.city}</p>
                    )}
                </div>

                <div>
                    <label>Province:</label>
                    {isEditing ? (
                        <input
                            type="text"
                            name="address.province"
                            value={updatedUser.address.province}
                            onChange={handleChange}
                        />
                    ) : (
                        <p>{userProfile.address.province}</p>
                    )}
                </div>

                <div>
                    <label>Country:</label>
                    {isEditing ? (
                        <input
                            type="text"
                            name="address.country"
                            value={updatedUser.address.country}
                            onChange={handleChange}
                        />
                    ) : (
                        <p>{userProfile.address.country}</p>
                    )}
                </div>

                <div>
                    <label>Postal Code:</label>
                    {isEditing ? (
                        <input
                            type="text"
                            name="address.postal_code"
                            value={updatedUser.address.postal_code}
                            onChange={handleChange}
                        />
                    ) : (
                        <p>{userProfile.address.postal_code}</p>
                    )}
                </div>

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

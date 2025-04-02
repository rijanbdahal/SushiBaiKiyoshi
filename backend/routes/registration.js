const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../dbconnection");
const logger = require('../utils/debug-logger');

const router = express.Router();
const ROUTE_NAME = 'registration';

router.post("/", async (req, res) => {
    logger.routeCalled(req, ROUTE_NAME);
    const { firstName, lastName, email, password, phoneNumber, userType, postalCode, country, province, city, streetAddress } = req.body;
    logger.action(ROUTE_NAME, 'Registering new user', { email, userType });

    // Validate that all required fields are provided
    if (!firstName || !lastName || !email || !password || !phoneNumber || !userType || !postalCode || !country || !province || !city || !streetAddress) {
        logger.action(ROUTE_NAME, 'Missing required fields', req.body);
        return res.status(400).json({ message: "All fields are required" });
    }

    let connection;
    try {
        // Get database connection and start a transaction
        logger.action(ROUTE_NAME, 'Starting transaction');
        connection = await db.getConnection();
        await connection.beginTransaction();

        // Check if email already exists
        logger.action(ROUTE_NAME, 'Checking if email exists', { email });
        const [existingUsers] = await connection.query("SELECT user_id FROM users WHERE email_address = ?", [email]);
        if (existingUsers.length > 0) {
            logger.action(ROUTE_NAME, 'Email already in use', { email });
            await connection.rollback();
            return res.status(400).json({ message: "Email already in use" });
        }

        // Hash the password
        logger.action(ROUTE_NAME, 'Hashing password');
        const hashedPassword = await bcrypt.hash(password, 10);

        // Step 1: Insert or get the existing address
        logger.action(ROUTE_NAME, 'Inserting address', { postalCode, city });
        const addressQuery = `
            INSERT INTO full_address (postal_code, country, province, city, street_address)
            VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE address_id = LAST_INSERT_ID(address_id)`;

        const [addressResult] = await connection.query(addressQuery, [postalCode, country, province, city, streetAddress]);
        const addressId = addressResult.insertId;
        logger.action(ROUTE_NAME, 'Address inserted or retrieved', { addressId });

        // Step 2: Insert user into the users table
        logger.action(ROUTE_NAME, 'Creating user account', { email, firstName, lastName });
        const userQuery = `
            INSERT INTO users (first_name, last_name, email_address, password, phone_number, user_type, address_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)`;

        const [userResult] = await connection.query(userQuery, [firstName, lastName, email, hashedPassword, phoneNumber, userType, addressId]);
        const userId = userResult.insertId;
        logger.action(ROUTE_NAME, 'User created', { userId });

        // If userType is "A" (Admin), insert an employee record
        if (userType === "A") {
            logger.action(ROUTE_NAME, 'Creating admin employee record', { userId });
            const employeeQuery = `
                INSERT INTO employees (user_id, role)
                VALUES (?, ?)`;
            await connection.query(employeeQuery, [userId, "admin"]); // Insert with role as "admin"
            logger.action(ROUTE_NAME, 'Admin employee record created', { userId });
        }
        else {
            logger.action(ROUTE_NAME, 'Creating customer record', { userId });
            const customerQuery =`
            INSERT INTO customers (user_id)
            VALUES (?)`;
            await connection.query(customerQuery, [userId]);
            logger.action(ROUTE_NAME, 'Customer record created', { userId });
        }

        // Commit the transaction
        logger.action(ROUTE_NAME, 'Committing transaction');
        await connection.commit();
        logger.action(ROUTE_NAME, 'User registered successfully', { userId, email });
        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        if (connection) {
            logger.action(ROUTE_NAME, 'Rolling back transaction due to error');
            await connection.rollback(); // Rollback in case of failure
        }
        logger.error(ROUTE_NAME, 'Error registering user', error);
        console.error("Error:", error);
        res.status(500).json({ message: "Internal server error" });
    } finally {
        if (connection) {
            logger.action(ROUTE_NAME, 'Releasing connection');
            connection.release(); // Release connection
        }
    }
});

module.exports = router;
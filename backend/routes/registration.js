const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../dbconnection");

const router = express.Router();

router.post("/", async (req, res) => {
    const { firstName, lastName, email, password, phoneNumber, userType, postalCode, country, province, city, streetAddress } = req.body;

    // Validate that all required fields are provided
    if (!firstName || !lastName || !email || !password || !phoneNumber || !userType || !postalCode || !country || !province || !city || !streetAddress) {
        return res.status(400).json({ message: "All fields are required" });
    }

    let connection;
    try {
        // Get database connection and start a transaction
        connection = await db.getConnection();
        await connection.beginTransaction();

        // Check if email already exists
        const [existingUsers] = await connection.query("SELECT user_id FROM users WHERE email_address = ?", [email]);
        if (existingUsers.length > 0) {
            await connection.rollback();
            return res.status(400).json({ message: "Email already in use" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Step 1: Insert or get the existing address
        const addressQuery = `
            INSERT INTO full_address (postal_code, country, province, city, street_address)
            VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE address_id = LAST_INSERT_ID(address_id)`;

        const [addressResult] = await connection.query(addressQuery, [postalCode, country, province, city, streetAddress]);
        const addressId = addressResult.insertId;

        // Step 2: Insert user into the users table
        const userQuery = `
            INSERT INTO users (first_name, last_name, email_address, password, phone_number, user_type, address_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)`;

        const [userResult] = await connection.query(userQuery, [firstName, lastName, email, hashedPassword, phoneNumber, userType, addressId]);

        // If userType is "A" (Admin), insert an employee record
        if (userType === "A") {
            const employeeQuery = `
                INSERT INTO employees (user_id, role)
                VALUES (?, ?)`;
            await connection.query(employeeQuery, [userResult.insertId, "admin"]); // Insert with role as "admin"
        }
        else{
            const customerQuery =`
            INSERT INTO customers (user_id)
            VALUES (?)`;
            await connection.query(customerQuery, [userResult.insertId]);
        }

        // Commit the transaction
        await connection.commit();
        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        if (connection) await connection.rollback(); // Rollback in case of failure
        console.error("Error:", error);
        res.status(500).json({ message: "Internal server error" });
    } finally {
        if (connection) connection.release(); // Release connection
    }
});

module.exports = router;

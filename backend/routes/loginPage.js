const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../dbconnection');

const router = express.Router();
const SECRET_KEY = "egwfdnkln1234nkwenafdb3qih4qwjdsandaf";

router.post("/authenticateUser", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Missing email or password" });
    }

    console.log("Checking user credentials...");

    const query = "SELECT * FROM users WHERE email_address = ?";

    try {
        // Using the promise-based query with mysql2
        const [results] = await db.query(query, [email]);

        if (results.length === 0) {
            return res.status(401).json({ message: "User not found" });
        }

        const user = results[0];

        // Compare hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Create JWT token
        const token = jwt.sign(
            { userId: user.user_id, firstName: user.first_name, email: user.email_address },
            SECRET_KEY,
            { expiresIn: "2h" }
        );

        // Send success response with token and user data
        res.status(200).json({ message: "Login successful", token, user });

    } catch (err) {
        console.error("Database query error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
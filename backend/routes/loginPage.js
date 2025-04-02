const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../dbconnection');
const logger = require('../utils/debug-logger');

const router = express.Router();
const ROUTE_NAME = 'login';
const SECRET_KEY = process.env.SECRET_KEY;

router.post("/authenticateUser", async (req, res) => {
    logger.routeCalled(req, ROUTE_NAME);
    const { email, password } = req.body;
    logger.action(ROUTE_NAME, 'Authenticating user', { email });

    if (!email || !password) {
        logger.action(ROUTE_NAME, 'Missing email or password');
        return res.status(400).json({ message: "Missing email or password" });
    }

    logger.action(ROUTE_NAME, 'Checking user credentials');
    console.log("Checking user credentials...");

    const query = "SELECT * FROM users WHERE email_address = ?";

    try {
        // Using the promise-based query with mysql2
        logger.action(ROUTE_NAME, 'Executing user query');
        const [results] = await db.query(query, [email]);

        if (results.length === 0) {
            logger.action(ROUTE_NAME, 'User not found', { email });
            return res.status(401).json({ message: "User not found" });
        }

        const user = results[0];
        logger.action(ROUTE_NAME, 'User found, verifying password', { user_id: user.user_id });

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            logger.action(ROUTE_NAME, 'Invalid credentials', { user_id: user.user_id });
            return res.status(401).json({ message: "Invalid credentials" });
        }

        logger.action(ROUTE_NAME, 'Password verified, generating token', { user_id: user.user_id });
        const token = jwt.sign(
            { userId: user.user_id, firstName: user.first_name, email: user.email_address },
            SECRET_KEY,
            { expiresIn: "2h" }
        );

        // Send success response with token and user data
        logger.action(ROUTE_NAME, 'Login successful', { user_id: user.user_id });
        res.status(200).json({ message: "Login successful", token, user });

    } catch (err) {
        logger.error(ROUTE_NAME, 'Database query error', err);
        console.error("Database query error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
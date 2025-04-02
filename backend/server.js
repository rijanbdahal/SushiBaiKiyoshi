// server.js
require('dotenv').config();
const express = require('express');
const cors = require("cors");
const logger = require('./utils/debug-logger');

// Import route modules
const loginPage = require("./routes/loginPage");
const registration = require("./routes/registration");
const inventory = require("./routes/inventory");
const receivefish = require("./routes/receiveFish");
const supplieraddress = require("./routes/addSupplierAddress");
const placeorder = require("./routes/handleOrder");
const menuitems = require('./routes/addMenuItems');
const cards = require("./routes/handleCards");
const users = require("./routes/handleUsers");
const profile = require("./routes/handleProfile");
const analytics = require("./routes/analytics");

const app = express();
const PORT = process.env.PORT || 5000;

// Global middleware
app.use(cors());
app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
    console.log(`[API][${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Register routes
app.use("/loginPage", loginPage);
app.use("/registerUser", registration);
app.use("/inventory", inventory);
app.use("/receivefish", receivefish);
app.use("/supplieraddress", supplieraddress);
app.use("/handleorder", placeorder);
app.use("/menuitems", menuitems);
app.use("/users", users);
app.use("/cards", cards);
app.use("/profile", profile);
app.use("/analytics", analytics);

// Global error handler
app.use((err, req, res, next) => {
    logger.error('Global', 'Unhandled exception', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
    logger.action('Server', `Server started on port ${PORT}`);
});

// For testing/module exports
module.exports = app;
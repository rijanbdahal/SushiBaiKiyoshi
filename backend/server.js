// server.js
require('dotenv').config();
const express = require('express');
const cors = require("cors");
const loginPage = require("./routes/loginPage");
const registration = require("./routes/registration");
const inventory = require("./routes/inventory");
const receivefish = require("./routes/receivefish");
const supplieraddress = require("./routes/addSupplierAddress");
const placeorder = require("./routes/handleOrder");
const menuitems = require('./routes/addMenuItems');
const cards = require("./routes/handleCards");
const users = require("./routes/handleUsers");
const profile = require("./routes/handleProfile");
const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/loginPage", loginPage);
app.use("/registerUser",registration);
app.use("/inventory",inventory);
app.use("/receivefish",receivefish);
app.use("/supplieraddress",supplieraddress);
app.use("/handleorder",placeorder);
app.use("/menuitems",menuitems);
app.use("/users",users);
app.use("/cards",cards);
app.use("/profile",profile);
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

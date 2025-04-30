require("dotenv").config();
require("./config/db.config");

const express = require('express');

const app = express();

app.use(express.json());

app.use("/users", require("./routes/user.route"));
app.use("/auth", require("./routes/auth.route"));
app.use("/pathways", require("./routes/pathway.route"));
app.use("/modules", require("./routes/module.route"));

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});

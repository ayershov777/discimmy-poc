require("dotenv").config();
require("./config/db.config");

const express = require('express');

const app = express();

app.use(require("morgan")("dev"));
app.use(require("cors")());
app.use(express.json());

app.use("/api/v1/auth", require("./routes/auth.route"));
app.use("/api/v1/users", require("./routes/user.route"));
app.use("/api/v1/pathways", require("./routes/pathway.route"));
app.use("/api/v1/modules", require("./routes/module.route"));

app.get('/', (req, res) => {
    res.send('API is running');
});

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

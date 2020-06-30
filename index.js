const express = require("express");
const mongoose = require("mongoose");

const app = express();

if (!process.env.jwtPrivateKey) {
    console.error("Private key not set\nShutting down server");
    process.exit(0);
}

mongoose
    .connect(process.env.MONGODB_URI || "mongodb://localhost/makedeveloper", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB connected"))
    .catch(() => {
        console.error("Could not connect to MongoDB");
        process.exit(0);
    });

app.use(express.json());

const port = process.env.PORT || 4500;
app.listen(port, () => {
    console.log(`Express server started at port ${port}`);
});
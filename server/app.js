const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

// Middleware to parse json
app.use(express.json());

// Cors setup
const allowedOrigins = process.env.FRONTEND_URL?.split(",") || ["http://localhost:3000"];

app.use(cors({
     origin: allowedOrigins,
     credentials: true
}));

// cookie parser
app.use(cookieParser());

// route
app.get("/", (req, res) => {
     res.send("Hello from Abhimanyu");
});

// app.all('*', (req, res) => {
//      res.status(404).send('OOPs !! 404 page not found');
// });

module.exports = app;
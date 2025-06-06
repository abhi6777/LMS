import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import userRoutes from './routes/user.routes.js';
import errorMiddleware from './middlewares/error.middleware.js';

const app = express();

// Middleware to parse JSON
app.use(express.json());

// CORS setup
const allowedOrigins = process.env.FRONTEND_URL?.split(",") || ["http://localhost:3000"];
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.use(morgan("dev"));

// Cookie parser
app.use(cookieParser());

// Routes
app.use("/api/v1/user", userRoutes);

app.get("/", (req, res) => {
    res.send("Hello from Abhimanyu");
});

app.use(errorMiddleware);

// 404 handler (optional)
// app.all('*', (req, res) => {
//     res.status(404).send('OOPs !! 404 page not found');
// });

export default app;

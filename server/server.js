import dotenv from 'dotenv';
import app from './app.js';
import connectDb from './config/db.connect.js';

dotenv.config();

const PORT = process.env.PORT || 4000;

const startServer = async () => {
    try {
        await connectDb();
        app.listen(PORT, () => {
            console.log(`Server is Running At http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Error in connection: ", error);
    }
};

startServer();

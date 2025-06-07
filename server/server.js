import dotenv from 'dotenv';
import app from './app.js';
import connectDb from './config/db.connect.js';
import cloudinary from 'cloudinary';

dotenv.config();
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    api_key: process.env.CLOUDINARY_API_KEY
});

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

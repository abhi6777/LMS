import mongoose from 'mongoose';

mongoose.set('strictQuery', false);

const dbConnect = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected To Database successfully");
    } catch (error) {
        console.error("Database Connection Failed");
    }
};

export default dbConnect;

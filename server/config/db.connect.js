const mongoose = require("mongoose");

mongoose.set('strictQuery', false);

const dbConnect = async() => {
     try {
          const conn = await mongoose.connect(process.env.MONGO_URI);
          console.log("Connected To Database successfully");
     } catch (error) {
          console.log("Database Connection Failed");
     }
};

module.exports = dbConnect;
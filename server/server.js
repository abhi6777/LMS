require("dotenv").config();
const app = require("./app");
const connectDb = require("./config/db.connect.js");

const PORT = process.env.PORT || 4000;

const startServer = async () => {
     try {
          // Connecting to database
         await connectDb();

          // Starting the server
          app.listen(PORT, () => {
               console.log(`Server is Running At http://localhost:${PORT}`);
          });     
     } catch (error) {
          console.log("Error in connection: ", error);
     }
}

startServer();
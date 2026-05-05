import mongoose from "mongoose";

let isConnected = false;

// establish the connection to mongodb
export const connectDB = async() : Promise<void> =>{
   try{

    if(isConnected){
        console.log("MongoDb already connected");
        return;
    }

    const MONGOURI = process.env.MONGODB_URL;

    if(!MONGOURI){
        throw new Error(
            "MongoDB connection string is not defined in environment variables."
        );
    }

    await mongoose.connect(MONGOURI);
    isConnected = true;
    console.log("MongoDB connected successfully");
    } catch(error){
       console.error(`Error connecting to MongoDB: ${error}`);
       process.exit(1); // telling the os some error occured

    }

};

// Disconnect from MongoDb manually
export const disconnectDB = async() : Promise<void> =>{
    try {
        if(!isConnected){
         console.log("MongoDB is not connected");
         return;
        }

        await mongoose.connection.close();
        isConnected = false;
        console.log("MongoDB connection closed");
    } catch (error) {
        console.error(`Error disconnecting from MongoDB: ${error}`);
        // no exit code should be here
    }
};

// Graceful shutdown handlers (like by pressing ctrl + c)
const gracefulShutdown = async(signal : string) =>{
    try {
        console.log(`\nReceived ${signal}. Closing MongoDB connection...`);
        await mongoose.connection.close();
        isConnected = false;
        console.log("MongoDB connection closed due to app termination");
        process.exit(0);

    } catch (error) {
       console.error("Error during MongoDB shutdown:", error);
       process.exit(1); 
    }
};


// Listen for the SIGINT event, but execute the handler only one time, then automatically remove it
process.once("SIGINT", () => gracefulShutdown("SIGINT"));
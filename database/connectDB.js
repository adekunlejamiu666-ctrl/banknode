const mongoose = require("mongoose")

let connectionPromise = null

const connectDB= async()=>{
    if(mongoose.connection.readyState===1) return

    if (connectionPromise) return connectionPromise

    const uri = process.env.DB_URI
    if (typeof uri !== "string" || uri.length === 0) {
        throw new Error("DB_URI environment variable is required")
    }

    connectionPromise = mongoose
    .connect(uri)
    .then(()=>{
        console.log("Database connected successfully");
        
    })
    .catch((err)=>{
        connectionPromise=null;
        console.log(err);
        throw err;
        
    })

    return connectionPromise
}

module.exports= connectDB



//0 ->disconnected
//1 ->connected
//2->connecting
//3 ->disconnecting
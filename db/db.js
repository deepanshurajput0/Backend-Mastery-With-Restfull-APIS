import mongoose from "mongoose";


export const ConnectDb = async()=>{
    try {
      const dbConnect =  await mongoose.connect(process.env.MONGO_URL)
      console.log(`Database Connected Successfully ${dbConnect.connection.host}`)
    } catch (error) {
        console.log(`Error while Connecting ${error}`)
    }
}






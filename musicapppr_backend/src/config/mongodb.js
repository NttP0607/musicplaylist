import mongoose from "mongoose";

const connectDB = async () => {

    mongoose.connection.on('connected', () => {
        console.log("connection es");
    })
    await mongoose.connect(`${process.env.MONGODB_URI}/musicapppr`)
}
export default connectDB;
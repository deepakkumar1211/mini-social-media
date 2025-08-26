import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`)
        console.log(`MongoDB connected !! DB HOST : ${connectionInstance.connection.host}`);
    } catch (err) {
        console.error('MongoDB connection Failed. ', err.message);
        process.exit(1);
    }
};

export default connectDB;

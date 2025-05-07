import mongoose from 'mongoose';

export const connectToMongo = async () => {
    const url = process.env.MONGO_URI;
    try {
        const { connection } = await mongoose.connect(url);
        console.info(`Connected to Mongo Successfully ${connection.host}:${connection.port}`)
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
};

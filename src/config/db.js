import mongoose from 'mongoose';

const baseUrl = process.env.MONGODB || '0.0.0.0:27017';
const collectionName = process.env.dbName

export const connectUsingMongoose = async () => {
    try {
        await mongoose.connect(`mongodb://${baseUrl}/${collectionName}` , {
       });
        console.log("MongoDB connected using mongoose");
    } catch (err) {
        console.log(err);
    }
}
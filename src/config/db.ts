import mongoose from 'mongoose';
import colors from 'colors'

mongoose.Promise = global.Promise;

const options: object = {
    useNewUrlParser: true,
    // useCreateIndex: true,
    autoIndex: true,
    keepAlive: true,
    maxPoolSize: 10,
    // bufferMaxEntries: 0,
    wtimeoutMS:60000,
    connectTimeoutMS: 60000,
    socketTimeoutMS: 60000,
    serverSelectionTimeoutMS: 60000,
    family: 4,
    // useFindAndModify: false,
    useUnifiedTopology: true
}

const connectDB = async () => {
    const dbConn = await mongoose.connect(process.env.MONGODB_URI || '', options)

    console.log(`Database Connnected: ${dbConn.connection.host}`.cyan.underline.bold);
}

export default connectDB;
import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect(Process.env.MONGO_URI);
        console.log('MongoDB kết nối thành công');
    }
    catch (error) {
        console.error('Lỗi kết nối MongoDB:', error);
        process.exit(1);
    }

};

export default connectDB;
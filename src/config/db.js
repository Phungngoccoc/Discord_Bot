// src/config/db.js
const mongoose = require('mongoose');
require("dotenv").config();
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Kết nối MongoDB Cloud (Atlas) thành công!");
    } catch (error) {
        console.error("Lỗi kết nối MongoDB:", error);
        process.exit(1);
    }
};

module.exports = connectDB;

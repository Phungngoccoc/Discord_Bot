const express = require("express");
const mongoose = require("mongoose");
const routes = require("./route/index"); // Import routes từ index.js
const connectDB = require('./config/db');  // Thay đổi đường dẫn import
const app = express();
app.use(express.json());

// Kết nối MongoDB
connectDB();  // Kết nối với MongoDB

// Sử dụng toàn bộ routes từ `routes/index.js`
app.use("/api", routes);

app.listen(3001, () => {
    console.log("🚀 Server chạy trên cổng 3000");
});

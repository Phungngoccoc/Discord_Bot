const express = require("express");
const quizRoutes = require("./quizRoutes");

const router = express.Router();

router.use("/quiz", quizRoutes);

module.exports = router;

const dotenv = require("dotenv");
const express = require("express");
const connectDb = require("./config/db");

dotenv.config();

connectDb();

const userRoute = require("./routes/userRoute");
const challengeRoute = require("./routes/challengeRoute");
const challengeRouteUser = require("./routes/user/challengeRoute");
const compileRoute = require("./routes/compileRoute");
const submitRoute = require("./routes/submitRoute");
const commentRoute = require("./routes/commentRoute");
const classRoute = require("./routes/classRoute");
const statisticRoute = require("./routes/statisticRoute");

const { errorHandler } = require("./middlewares/errorHandle");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());
// Add headers
// app.use(function (req, res, next) {
// 	res.setHeader("Access-Control-Allow-Origin", "*");

// 	res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");

// 	res.setHeader("Access-Control-Allow-Headers", "Origin ,X-Requested-With, Content-type, Accept, Authorization");

// 	res.setHeader("Access-Control-Allow-Credentials", true);

// 	next();
// });

app.use("/api/v1/user", userRoute);
app.use("/api/v1/challenge", challengeRoute);
app.use("/api/v1/user-api/challenge", challengeRouteUser);
app.use("/api/v1/compile", compileRoute);
app.use("/api/v1/submit", submitRoute);
app.use("/api/v1/comment", commentRoute);
app.use("/api/v1/class", classRoute);
app.use("/api/v1/statistic", statisticRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));

app.use(errorHandler);

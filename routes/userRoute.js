const express = require("express");
const { register, login, logout, getUserByKeyword, getUserInfo } = require("../controllers/userController");
const { jwtAuth } = require("../middlewares/jwtAuth");
const { roleMiddleware } = require("../middlewares/roleMiddleware");
const { ROLE } = require("../utils/constants");
const router = express.Router();

router.get("/", getUserByKeyword);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", jwtAuth, roleMiddleware(ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN), getUserInfo);

module.exports = router;

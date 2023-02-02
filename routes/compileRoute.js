const express = require("express");
const { compileCode } = require("../controllers/compileController");

const { jwtAuth } = require("../middlewares/jwtAuth");
const { roleMiddleware } = require("../middlewares/roleMiddleware");
const { ROLE } = require("../utils/constants");

const router = express.Router();

router.post("/", jwtAuth, roleMiddleware(ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN), compileCode);

module.exports = router;

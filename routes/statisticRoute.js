const express = require("express");
const { statisticAll } = require("../controllers/statisticController");

const { jwtAuth } = require("../middlewares/jwtAuth");
const { roleMiddleware } = require("../middlewares/roleMiddleware");
const { ROLE } = require("../utils/constants");

const router = express.Router();

router.get("/all", jwtAuth, roleMiddleware(ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN), statisticAll);

module.exports = router;

const express = require("express");
const { submitChallenge, submitExerciseChallenge, submitExam } = require("../controllers/UserDoingController");

const { jwtAuth } = require("../middlewares/jwtAuth");
const { roleMiddleware } = require("../middlewares/roleMiddleware");
const { ROLE } = require("../utils/constants");

const router = express.Router();

router.post("/challenge", jwtAuth, roleMiddleware(ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN), submitChallenge);
router.post("/submit-exercise", jwtAuth, roleMiddleware(ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN), submitExerciseChallenge);
router.post("/submit-exam", jwtAuth, roleMiddleware(ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN), submitExam);

module.exports = router;

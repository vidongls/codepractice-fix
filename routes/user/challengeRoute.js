const express = require("express");
const {
	getAllChallenge,
	getById,
	challengeNewest,
	challengeRanking,
	getRandomChallenge,
	userSearchChallenge,
	getAllChallengeByClass,
	getChallengeById,
} = require("../../controllers/user/challengeController");
const { getDoingById } = require("../../controllers/UserDoingController");
const { jwtAuth } = require("../../middlewares/jwtAuth");
const { roleMiddleware } = require("../../middlewares/roleMiddleware");
const { ROLE } = require("../../utils/constants");

const router = express.Router();

router.get("/", jwtAuth, roleMiddleware(ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN), getAllChallenge);
router.get("/:id", jwtAuth, roleMiddleware(ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN), getChallengeById);
// router.get("/:id", jwtAuth, roleMiddleware(ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN), getById);
router.get("/all/newest", jwtAuth, roleMiddleware(ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN), challengeNewest);
router.get("/all/ranking", jwtAuth, roleMiddleware(ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN), challengeRanking);
router.get("/user/get-random", jwtAuth, roleMiddleware(ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN), getRandomChallenge);
router.get("/:id/get-exam", jwtAuth, roleMiddleware(ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN), getAllChallengeByClass);

router.get("/:id/get-doing-challenge", jwtAuth, roleMiddleware(ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN), getDoingById);

//User Api --------

router.get("/user/search", jwtAuth, roleMiddleware(ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN), userSearchChallenge);

module.exports = router;

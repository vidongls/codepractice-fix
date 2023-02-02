const express = require("express");
const {
	createChallenge,
	updateChallenge,
	updateChangeStatus,
	removeChallenge,
	getAllChallenge,
	getById,
	challengeNewest,
	changeRealtime,
	startRealtimeChallenge,
	staticsChallengeRealtime,
	challengeRanking,
	getRandomChallenge,
	addClassToChallenge,
	userSearchChallenge,
	getAllExam,
} = require("../controllers/challengeController");
const { startDoingChallenge, getDoingById } = require("../controllers/UserDoingController");
const { jwtAuth } = require("../middlewares/jwtAuth");
const { roleMiddleware } = require("../middlewares/roleMiddleware");
const { ROLE } = require("../utils/constants");

const router = express.Router();

router.get("/", jwtAuth, roleMiddleware(ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN), getAllChallenge);
router.get("/:id", jwtAuth, roleMiddleware(ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN), getById);
router.get("/all/newest", jwtAuth, roleMiddleware(ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN), challengeNewest);
router.get("/all/ranking", jwtAuth, roleMiddleware(ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN), challengeRanking);
router.get("/all/exam", jwtAuth, roleMiddleware(ROLE.ADMIN, ROLE.SUPER_ADMIN), getAllExam);
router.get("/user/get-random", jwtAuth, roleMiddleware(ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN), getRandomChallenge);

router.get("/:id/realtime-statics", jwtAuth, roleMiddleware(ROLE.ADMIN, ROLE.SUPER_ADMIN), staticsChallengeRealtime);

router.post("/:id/start-challenge", jwtAuth, roleMiddleware(ROLE.ADMIN, ROLE.SUPER_ADMIN), startRealtimeChallenge);
router.post("/:id/change-realtime", jwtAuth, roleMiddleware(ROLE.ADMIN, ROLE.SUPER_ADMIN), changeRealtime);
router.post("/:id/start-doing-challenge", jwtAuth, roleMiddleware(ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN), startDoingChallenge);

router.post("/:id/add-class-to-challenge", jwtAuth, roleMiddleware(ROLE.ADMIN, ROLE.SUPER_ADMIN), addClassToChallenge);

router.get("/:id/get-doing-challenge", jwtAuth, roleMiddleware(ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN), getDoingById);

router.post("/", jwtAuth, roleMiddleware(ROLE.ADMIN, ROLE.SUPER_ADMIN), createChallenge);

router.put("/:id", jwtAuth, roleMiddleware(ROLE.ADMIN, ROLE.SUPER_ADMIN), updateChallenge);
router.put("/:id/disable", jwtAuth, roleMiddleware(ROLE.ADMIN, ROLE.SUPER_ADMIN), updateChangeStatus);

router.delete("/:id", jwtAuth, roleMiddleware(ROLE.ADMIN, ROLE.SUPER_ADMIN), removeChallenge);

//User Api --------

router.get("/user/search", jwtAuth, roleMiddleware(ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN), userSearchChallenge);

module.exports = router;

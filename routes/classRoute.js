const express = require("express");
const {
	createClass,
	addUserToClass,
	removeUserFromClass,
	getAllClass,
	getClassByAuthor,
	getById,
	removeClass,
	updateClass,
	getAllExamDoing,
	getOneExamDoing,
	getStudentsInfo,
} = require("../controllers/classController");
const { jwtAuth } = require("../middlewares/jwtAuth");
const { roleMiddleware } = require("../middlewares/roleMiddleware");
const { ROLE } = require("../utils/constants");

const router = express.Router();

router.get("/", jwtAuth, roleMiddleware(ROLE.ADMIN, ROLE.SUPER_ADMIN), getAllClass);
router.get("/:id", jwtAuth, roleMiddleware(ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN), getById);
router.put("/:id", jwtAuth, roleMiddleware(ROLE.ADMIN, ROLE.SUPER_ADMIN), updateClass);
router.delete("/:id", jwtAuth, roleMiddleware(ROLE.ADMIN, ROLE.SUPER_ADMIN), removeClass);
router.get("/get-by/author", jwtAuth, roleMiddleware(ROLE.ADMIN, ROLE.SUPER_ADMIN), getClassByAuthor);
router.get("/get-all/exam-doing", jwtAuth, roleMiddleware(ROLE.ADMIN, ROLE.SUPER_ADMIN), getAllExamDoing);
router.get("/get-one/exam-doing", jwtAuth, roleMiddleware(ROLE.ADMIN, ROLE.SUPER_ADMIN), getOneExamDoing);
router.get("/get-one/student-info", jwtAuth, roleMiddleware(ROLE.ADMIN, ROLE.SUPER_ADMIN), getStudentsInfo);

router.post("/", jwtAuth, roleMiddleware(ROLE.ADMIN, ROLE.SUPER_ADMIN), createClass);
router.post("/:id/add-user", jwtAuth, roleMiddleware(ROLE.ADMIN, ROLE.SUPER_ADMIN), addUserToClass);
router.post("/:id/remove-user", jwtAuth, roleMiddleware(ROLE.ADMIN, ROLE.SUPER_ADMIN), removeUserFromClass);

module.exports = router;

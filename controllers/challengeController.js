const ChallengeModel = require("../models/challengeModel");
const { generateId } = require("../utils/helper");
const { fireGet, fireSet, fireUpdate, fireGetOne, fireDelete } = require("../services/firebaseUntil");
const UserDoChallenge = require("../models/userDoChallenge");
const { ROLE } = require("../utils/constants");
const { map, get } = require("lodash");
const { challengeEndedJob } = require("../jobs/challengeJobs");

const createChallenge = async (req, res) => {
	const { title, describe, level, testCase, functionName, content, isRealtime, time } = req.body;

	try {
		const code = "CH" + generateId();

		const challenge = await ChallengeModel.create({
			title,
			code,
			describe,
			level,
			testCase,
			author: req.user.userId,
			functionName,
			content,
			isRealtime,
			time,
			status: "NEW",
		});

		res.status(201).json({
			code: "SUCCESS",
			msg: "Create challenge success",
			data: challenge,
		});
	} catch (error) {
		res.status(400).send(error);
		throw new Error("Create challenge error");
	}
};

const getAllChallenge = async (req, res, next) => {
	const pageSize = 25;
	const page = Number(req.query.pageNumber) || 1;

	const roleUser = req.user.role;
	const isManager = [ROLE.ADMIN, ROLE.SUPER_ADMIN].includes(roleUser);

	const keyword = req.query
		? {
				...req.query,
				title: {
					$regex: `${req.query?.title ? req.query?.title?.trim().toLocaleLowerCase() : ""}`,
					$options: "i",
				},
				...(isManager ? { author: req.user.userId } : {}),
		  }
		: {};

	const count = await ChallengeModel.countDocuments({ ...keyword });
	const challenge = await ChallengeModel.find({
		...keyword,
		isRealtime: false,
	})
		.sort({ createdAt: -1 })
		.populate("author", "userName")
		.populate("countDoChallenge", "isResolved user")
		.populate("classes", "name")
		.select(`${!isManager ? "-testCase -content -describe" : ""}`);

	res.status(200).json({
		challenge,
		pagination: { page, pages: Math.ceil(count / pageSize) },
	});
};

const getAllExam = async (req, res, next) => {
	const pageSize = 25;
	const page = Number(req.query.pageNumber) || 1;

	const roleUser = req.user.role;
	const isManager = [ROLE.ADMIN, ROLE.SUPER_ADMIN].includes(roleUser);

	const keyword = req.query
		? {
				...req.query,
				title: {
					$regex: `${req.query?.title ? req.query?.title?.trim().toLocaleLowerCase() : ""}`,
					$options: "i",
				},
				...(isManager ? { author: req.user.userId } : {}),
		  }
		: {};

	const count = await ChallengeModel.countDocuments({ ...keyword });
	const challenge = await ChallengeModel.find({
		...keyword,
		isRealtime: true,
	})
		.sort({ createdAt: -1 })
		.populate("author", "userName")
		.populate("countDoChallenge", "isResolved user")
		.populate("classes", "name")
		.select(`${!isManager ? "-testCase -content -describe" : ""}`);

	res.status(200).json({
		challenge,
		pagination: { page, pages: Math.ceil(count / pageSize) },
	});
};

const getById = async (req, res, next) => {
	const { id } = req.params;

	try {
		const challenge = await ChallengeModel.findById(id).populate({
			path: "comments",
			populate: {
				path: "author",
				// sort : ({ createdAt: -1 })

				// select: "userName",
				// select: "avatar"
			},
			options: {
				sort: { createdAt: -1 },
			},
		});

		if (challenge) {
			const roleUser = req.user.role;

			if ([ROLE.ADMIN, ROLE.SUPER_ADMIN].includes(roleUser)) {
				res.status(200).json(challenge);
				return;
			}

			if (challenge.isRealtime) {
				fireGetOne(`challenge-${id}`).then((data) => {
					if (data) {
						if (data?.started) {
							res.status(200).json(challenge);
						} else {
							res.status(200).json({
								_id: challenge._id,
								isRealtime: challenge.isRealtime,
							});
						}
					} else {
						res.status(200).json({
							_id: challenge._id,
							isRealtime: challenge.isRealtime,
						});
					}
				});
			} else {
				res.status(200).json(challenge);
			}
		} else {
			res.status(404).json({ code: "NOT_FOUND", msg: "Challenge invalid" });
		}

		// .populate("comments").populate("author", "userName");
	} catch (error) {
		console.log(error);
		res.status(400).json(error);
	}
};

const updateChallenge = async (req, res, next) => {
	const { title, describe, level, testCase, time, isRealtime } = req.body;
	const { id } = req.params;

	try {
		const challenge = await ChallengeModel.findByIdAndUpdate(id, { title, describe, level, testCase, time, isRealtime }, { new: true });

		// challenge.title = title;
		// challenge.describe = describe;
		// challenge.level = level;
		// challenge.testCase = testCase;
		// challenge.time = time;
		// challenge.isRealtime = isRealtime;

		if (!isRealtime) {
			await fireDelete(`challenge-${id}`);
		}

		const updateChallenge = await challenge.save();
		res.status(201).json({ code: "SUCCESS", msg: "Update challenge success", data: updateChallenge });
	} catch (error) {
		res.status(400).json(error);
		throw new Error("Update challenge error");
	}
};

const updateChangeStatus = async (req, res, next) => {
	const { isDisable } = req.body;
	const { id } = req.prams;
	const challenge = await ChallengeModel.findById(id);

	try {
		challenge.isDisable = isDisable;

		const updateChallenge = await ChallengeModel.save();
		res.status(201).json({ code: "SUCCESS", msg: "Update challenge status success", data: updateChallenge });
	} catch (error) {
		res.status(400).send(error);
		throw new Error("Update challenge status error");
	}
};

const removeChallenge = async (req, res) => {
	const challenge = await ChallengeModel.findById(req.params.id);

	try {
		if (challenge) {
			await challenge.remove();
			res.status(201).json({ code: "SUCCESS", msg: "Remove challenge success" });
		} else {
			res.status(404);
		}
	} catch (error) {
		console.log("🧙 ~ error", error);
		res.status(404);
		throw new Error("Remove challenge failed");
	}
};

const challengeNewest = async (req, res, next) => {
	try {
		const challenge = await ChallengeModel.find({}).sort({ createdAt: -1 }).select("title").limit(10);
		res.status(201).json({ code: "SUCCESS", msg: "Get challenge success", data: challenge });
	} catch (error) {
		res.status(400).send(error);
		throw new Error("Get challenge error");
	}
};

const challengeRanking = async (req, res, next) => {
	try {
		const challenge = await UserDoChallenge.find({}).populate("user");

		let result = Object.values(
			challenge.reduce((a, { user }) => {
				a[user._id] = a[user.id] || { count: 0, user };
				a[user.id].count++;
				return a;
			}, Object.create(null))
		);

		res.status(201).json({ code: "SUCCESS", msg: "Get challenge success", data: result });
	} catch (error) {
		console.log("🧙 ~ error", error);
		res.status(400).send(error);
	}
};

const changeRealtime = async (req, res) => {
	const { isRealtime } = req.body;
	const { id } = req.params;
	const challenge = await ChallengeModel.findById(id);

	if (challenge) {
		await fireUpdate(`challenge-${id}`, {
			started: false,
		});

		challenge.isRealtime = isRealtime;
		const challengeData = await challenge.save();

		res.status(201).json({ code: "SUCCESS", msg: "Change Realtime challenge success", data: challengeData });
	} else {
		res.status(404);
		throw new Error("Change Realtime challenge failed");
	}
};

// const startRealtimeChallenge = async (req, res) => {
// 	const { id } = req.params;
// 	const challenge = await ChallengeModel.findById(id);

// 	if (challenge) {
// 		challenge.startedAt = Date.now();
// 		const data = await challenge.save();
// 		// fireGet(`challenge-${id}`, (data) => {
// 		//     // console.log("🧙 ~ data", data);
// 		//     if (data?.started) {

// 		//     } else {
// 		//         res.status(200).json({ _id: challenge._id, isRealtime: challenge.isRealtime });
// 		//     }
// 		// });

// 		await fireSet(`challenge-${id}`, {
// 			started: true,
// 			startTime: Date.now(),
// 		});

// 		res.status(201).json({ code: "SUCCESS", msg: "Challenge start success", data });
// 	} else {
// 		res.status(404);
// 		throw new Error("Change Realtime challenge failed");
// 	}
// };

const startRealtimeChallenge = async (req, res) => {
	const { id } = req.params;

	try {
		const challenge = await ChallengeModel.findById(id);

		if (challenge) {
			map(challenge.classes, (idClass) => {
				const path = `classes/${idClass}/challenge-${id}`;
				fireSet(path, {
					started: true,
					startTime: Date.now(),
				});
				challengeEndedJob(challenge.time, path, id);
			});

			challenge.isExamStarted = true;
			challenge.status = "PROCESSING";
			challenge.startedAt = Date.now();
			await challenge.save();
			res.status(201).json({ code: "SUCCESS", msg: "Challenge start success" });
		} else {
			res.status(400).json({ msg: "Invalid" });
		}
	} catch (error) {
		console.log("🧙 ~ error", error);
		res.status(404);
		throw new Error("Change Realtime challenge failed");
	}
};

const staticsChallengeRealtime = async (req, res) => {
	const { id } = req.params;

	const userDoChallengeList = await UserDoChallenge.find({ challenge: id }).populate("challenge").populate({
		path: "user",
		select: "userName code firstName lastName",
	});
	// .select("-password");
	// populate({
	// 	path: "comments",
	// 	populate: {
	// 		path: "author",
	// 		// sort : ({ createdAt: -1 })

	// 		// select: "userName",
	// 		// select: "avatar"
	// 	},
	// 	options: {
	// 		sort: { createdAt: -1 },
	// 	},
	// })
	if (userDoChallengeList) {
		res.status(200).json({ data: userDoChallengeList });
	} else {
		res.status(500).json({ code: "SYSTEM_ERROR", msg: "System Error" });
		throw new Error("System Error");
	}
};

const getRandomChallenge = (req, res, next) => {
	try {
		ChallengeModel.find({ isRealtime: false })
			.count()
			.exec(function (err, count) {
				var random = Math.floor(Math.random() * count);

				ChallengeModel.findOne({ isRealtime: false })
					.skip(random)
					.select("title")
					.exec(function (err, result) {
						res.status(200).json({ code: "SUCCESS", msg: "Get challenge success", data: result });
					});
			});
	} catch (error) {
		res.status(400).send(error);
		throw new Error("Get challenge error");
	}
};

const addClassToChallenge = async (req, res, next) => {
	const { classes } = req.body;
	const { id } = req.params;

	try {
		const data = await ChallengeModel.findByIdAndUpdate(id, { classes }, { new: true });

		res.status(201).json({ code: "SUCCESS", msg: "Update classes success", data });
	} catch (error) {
		console.log("🧙 ~ error", error);
		res.status(400).send(error);
		throw new Error("Update classes error");
	}
};

const userSearchChallenge = async (req, res, next) => {
	const { title } = req.query;

	const keyword = req.query
		? {
				title: {
					$regex: `${title ? title : ""}`,
					$options: "i",
				},
		  }
		: {};

	const challenge = await ChallengeModel.find({
		...keyword,
		isRealtime: false,
	})
		.sort({ createdAt: -1 })
		.select("title");

	res.status(200).json({
		challenge,
	});
};

module.exports = {
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
};

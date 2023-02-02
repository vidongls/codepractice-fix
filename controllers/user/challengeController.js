const ChallengeModel = require("../../models/challengeModel");
const { generateId } = require("../../utils/helper");
const { fireGet, fireSet, fireUpdate, fireGetOne } = require("../../services/firebaseUntil");
const UserDoChallenge = require("../../models/userDoChallenge");
const { ROLE } = require("../../utils/constants");
const { get } = require("lodash");
const UserModel = require("../../models/usersModel");
const ClassModel = require("../../models/classModel");

const getAllChallenge = async (req, res, next) => {
	try {
		const { userId } = req.user;

		const userData = await UserModel.findById(userId);
		const userClasses = get(userData, "classes", []);
		const roleUser = get(userData, "role", "");

		const isManager = [ROLE.ADMIN, ROLE.SUPER_ADMIN].includes(roleUser);

		const keyword = req.query
			? {
					...req.query,
					title: {
						$regex: `${req.query?.title ? req.query?.title?.trim().toLocaleLowerCase() : ""}`,
						$options: "i",
					},
			  }
			: {};
		const challenge = await ChallengeModel.find({
			...keyword,
			isRealtime: false,
		})
			.sort({ createdAt: -1 })
			.populate("author", "userName")
			.populate("countDoChallenge", "isResolved user")
			.populate("classes", "name")
			.select(`${!isManager ? "-testCase -content -describe -classes -author -functionName" : ""}`);

		res.status(200).json({
			challenge,
		});
	} catch (error) {
		console.log("🧙 ~ error", error);
		res.status(404).json({ error: JSON.stringify(error) });
	}
};

const getAllChallengeByClass = async (req, res, next) => {
	try {
		const { userId } = req.user;
		const { id } = req.params;

		const classData = await ClassModel.findById(id);

		if (classData) {
			const userData = await UserModel.findById(userId);
			const roleUser = get(userData, "role", "");

			const keyword = req.query
				? {
						...req.query,
						title: {
							$regex: `${req.query?.title ? req.query?.title?.trim().toLocaleLowerCase() : ""}`,
							$options: "i",
						},
				  }
				: {};

			const isManager = [ROLE.ADMIN, ROLE.SUPER_ADMIN].includes(roleUser);
			const challenge = await ChallengeModel.find({
				...keyword,
				$and: [{ classes: { $all: id } }, { isRealtime: true }],
			})
				.sort({ createdAt: -1 })
				.populate("author", "userName")
				.populate("countDoChallenge", "isResolved user")
				.populate("classes", "name")
				.select(`${!isManager ? "-testCase -content -describe -classes -author -functionName" : ""}`);

			res.status(200).json({
				challenge,
				classes: classData,
			});
		} else {
			res.status(404).json({ error: "Class invalid" });
		}
	} catch (error) {
		console.log("🧙 ~ error", error);
		res.status(404).json({ error: JSON.stringify(error) });
	}
};

const getById = async (req, res, next) => {
	const { id } = req.params;

	try {
		const { userId } = req.user;

		const userData = await UserModel.findById(userId);
		const userClasses = get(userData, "classes", []);
		const roleUser = get(userData, "role", "");

		const isManager = [ROLE.ADMIN, ROLE.SUPER_ADMIN].includes(roleUser);

		const challenge = await ChallengeModel.findOne({
			_id: id,
			$or: [{ classes: { $all: userClasses } }],
		}).populate({
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
			if (isManager) {
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

const getChallengeById = async (req, res, next) => {
	const { id } = req.params;

	try {
		const challenge = await ChallengeModel.findOne({
			_id: id,
		}).populate({
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
			res.status(200).json(challenge);
			return;
		} else {
			res.status(404).json({ code: "NOT_FOUND", msg: "Challenge invalid" });
		}

		// .populate("comments").populate("author", "userName");
	} catch (error) {
		console.log(error);
		res.status(400).json(error);
	}
};

const challengeNewest = async (req, res, next) => {
	try {
		const challenge = await ChallengeModel.find({ isRealtime: false }).sort({ createdAt: -1 }).select("title").limit(10);
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
	})
		.sort({ createdAt: -1 })
		.select("title");

	res.status(200).json({
		challenge,
	});
};

module.exports = {
	getAllChallenge,
	getById,
	challengeNewest,
	challengeRanking,
	getRandomChallenge,
	userSearchChallenge,
	getAllChallengeByClass,
	getChallengeById,
};

const challengeModel = require("../models/challengeModel");
const userDoChallenge = require("../models/userDoChallenge");
const { fireGetOne } = require("../services/firebaseUntil");
const { compileProcess } = require("./compileController");
const mkdirp = require("mkdirp");
const path = require("path");

const submitChallenge = async (req, res, next) => {
	const { challengeId, answerContent } = req.body;

	try {
		const challenge = await challengeModel.findById(challengeId);

		if (challenge) {
			if (challenge.isRealtime) {
				fireGetOne(`challenge-${challengeId}`).then(async (data) => {
					if (data) {
						if (data?.started) {
							const duration = challenge.time;
							if (data?.startTime + duration < Date.now()) {
								res.status(201).json({
									code: "SUCCESS",
									msg: "Challenge đã kết thúc",
								});
								return;
							} else {
								await mkdirp("compile");

								const filePath = path.join(process.cwd(), "compile", `${req.user.userId + challengeId}.js`);
								const compileRes = await compileProcess(filePath, answerContent, challenge);
								try {
									const {
										data: { result },
									} = compileRes;
									const isResolved = result.every((item) => item.status);

									const dataExists = await userDoChallenge.findOne({
										user: req.user.userId,
										challenge: challengeId,
									});
									if (dataExists) {
										dataExists.answerContent = answerContent;
										dataExists.isResolved = isResolved;
										dataExists.compileResult = result;
										dataExists.endTime = Date.now();
										const userDoChallengeAfterChange = await dataExists.save();
										res.status(201).json({
											code: "SUCCESS",
											msg: "Submit challenge success",
											data: userDoChallengeAfterChange,
											dataCompile: compileRes.data,
										});
									} else {
										const userDoChallengeAfterCreate = await userDoChallenge.create({
											user: req.user.userId,
											challenge: challengeId,
											answerContent,
											compileResult: result,
											isResolved,
											startTime: Date.now(),
											endTime: Date.now(),
										});
										res.status(201).json({
											code: "SUCCESS",
											msg: "Submit challenge success",
											data: userDoChallengeAfterCreate,
											dataCompile: compileRes.data,
										});
									}
								} catch (error) {
									console.log("🧙 ~ error", error);
									res.status(400).send(error);
									throw new Error("Submit challenge error");
								}
							}
						}
					}
				});
			} else {
				await mkdirp("compile");

				const filePath = path.join(process.cwd(), "compile", `${req.user.userId + challengeId}.js`);
				const compileRes = await compileProcess(filePath, answerContent, challenge);
				try {
					const {
						data: { result },
					} = compileRes;
					const isResolved = result.every((item) => item.status);
					challenge.countSubmit++;
					if (isResolved) {
						challenge.countResolve++;
					}
					await challenge.save();
					const dataExists = await userDoChallenge.findOne({
						user: req.user.userId,
						challenge: challengeId,
					});
					if (dataExists) {
						dataExists.answerContent = answerContent;
						dataExists.isResolved = isResolved;
						dataExists.compileResult = result;
						dataExists.endTime = Date.now();
						const userDoChallengeAfterChange = dataExists.save();
						res.status(201).json({
							code: "SUCCESS",
							msg: "Submit challenge success",
							data: userDoChallengeAfterChange,
							dataCompile: compileRes.data,
						});
					} else {
						const userDoChallengeAfterCreate = await userDoChallenge.create({
							user: req.user.userId,
							challenge: challengeId,
							answerContent,
							compileResult: result,
							isResolved,
							startTime: Date.now(),
							endTime: Date.now(),
						});
						res.status(201).json({
							code: "SUCCESS",
							msg: "Submit challenge success",
							data: userDoChallengeAfterCreate,
							dataCompile: compileRes.data,
						});
					}
				} catch (error) {
					console.log("🧙 ~ error", error);
					res.status(400).send(error);
					throw new Error("Submit challenge error");
				}
			}
		} else {
			res.status(404).json({ code: "ERROR", msg: "Challenge Invalid" });
		}
	} catch (error) {
		console.log("🧙 ~ error", error);
		res.status(404).json({ code: "ERROR", msg: "Challenge Invalid" });
	}
};

const submitExerciseChallenge = async (req, res, next) => {
	const { challengeId, answerContent } = req.body;

	try {
		const challenge = await challengeModel.findById(challengeId);

		if (challenge) {
			try {
				await mkdirp("compile");

				const filePath = path.join(process.cwd(), "compile", `${req.user.userId + challengeId}.js`);
				const compileRes = await compileProcess(filePath, answerContent, challenge);

				const {
					data: { result },
					err,
				} = compileRes;
				const isResolved = result.every((item) => item.status);

				const dataExists = await userDoChallenge.findOne(
					{
						user: req.user.userId,
						challenge: challengeId,
					},
					function (err) {
						console.log(err);
					}
				);

				if (dataExists) {
					dataExists.answerContent = answerContent;
					dataExists.isResolved = isResolved;
					dataExists.compileResult = result;
					dataExists.endTime = Date.now();

					dataExists.save(function (err) {
						if (err) console.log(err);
					});

					res.status(201).json({
						code: "SUCCESS",
						msg: "Submit challenge success",
						// data: userDoChallengeAfterChange,
						dataCompile: compileRes.data,
						challengeTestCase: challenge.testCase,
					});

					// userDoChallenge
					// 	.findOneAndUpdate(
					// 		{
					// 			user: req.user.userId,
					// 			challenge: challengeId,
					// 		},
					// 		{ $set: { answerContent, compileResult: result, endTime: Date.now(), isResolved } },
					// 		function (err, doc) {
					// 			console.log("🧙 ~ doc", doc);
					// 			if (err) console.log(error);
					// 			return;
					// 		}
					// 	)
					// 	.then((challengeUpdated) => {
					// 		console.log("Success!");
					// 		console.log(challengeUpdated);

					// 		res.status(201).json({
					// 			code: "SUCCESS",
					// 			msg: "Submit challenge success",
					// 			data: challengeUpdated,
					// 			dataCompile: compileRes.data,
					// 			challengeTestCase: challenge.testCase,
					// 		});
					// 	})
					// 	.catch((err) => {
					// 		console.error("An error occured", err);
					// });
				} else {
					const userDoChallengeAfterCreate = await userDoChallenge.create({
						user: req.user.userId,
						challenge: challengeId,
						answerContent,
						compileResult: result,
						isResolved,
						isSubmit: true,
						startTime: Date.now(),
						endTime: Date.now(),
					});
					res.status(201).json({
						code: "SUCCESS",
						msg: "Submit challenge success",
						data: userDoChallengeAfterCreate,
						dataCompile: compileRes.data,
						challengeTestCase: challenge.testCase,
					});
				}
			} catch (error) {
				console.log("🧙 ~ error", error);
				res.status(400).send(error);
				throw new Error("Submit challenge error");
			}
		} else {
			res.status(404).json({ code: "ERROR", msg: "Challenge Invalid" });
		}
	} catch (error) {
		console.log("🧙 ~ error", error);
		res.status(404).json({ code: "ERROR", msg: "Challenge Invalid" });
	}
};

const submitExam = async (req, res, next) => {
	const { challengeId, answerContent } = req.body;

	try {
		const challenge = await challengeModel.findById(challengeId);

		if (challenge) {
			try {
				await mkdirp("compile");

				const filePath = path.join(process.cwd(), "compile", `${req.user.userId + challengeId}.js`);
				const compileRes = await compileProcess(filePath, answerContent, challenge);

				const {
					data: { result },
					err,
				} = compileRes;

				const isResolved = result.every((item) => item.status);

				const dataExists = await userDoChallenge.findOne({
					user: req.user.userId,
					challenge: challengeId,
				});

				if (dataExists) {
					res.status(403).json({
						code: "RESOLVED",
						msg: "User resolve challenge",
						data: dataExists,
					});
				} else {
					const userDoChallengeAfterCreate = userDoChallenge.create({
						user: req.user.userId,
						challenge: challengeId,
						answerContent,
						compileResult: result,
						isResolved,
						isSubmit: true,
						startTime: Date.now(),
						endTime: Date.now(),
					});
					res.status(201).json({
						code: "SUCCESS",
						msg: "Submit challenge success",
						data: userDoChallengeAfterCreate,
						dataCompile: compileRes.data,
						challengeTestCase: challenge.testCase,
					});
				}
			} catch (error) {
				console.log("🧙 ~ error", error);
				res.status(400).send(error);
				throw new Error("Submit challenge error");
			}
		} else {
			res.status(404).json({ code: "ERROR", msg: "Challenge Invalid" });
		}
	} catch (error) {
		console.log("🧙 ~ error", error);
		res.status(404).json({ code: "ERROR", msg: "Challenge Invalid" });
	}
};

const startDoingChallenge = async (req, res, next) => {
	const { id } = req.params;
	const { userId } = req.user;

	const challenge = await challengeModel.findById(id);

	if (challenge) {
		if (challenge.isRealtime) {
			const dataExists = await userDoChallenge.findOne({ user: userId, challenge: id });
			// check thêm đã làm hay chưa
			if (dataExists) {
				res.status(400).json({ code: "RESOLVE", msg: "Challenge is Resolved" });
			} else {
				const user = {
					user: userId,
					challenge: id,
					isResolved: false,
					startTime: Date.now(),
					endTime: Date.now(),
				};

				const userDoChallengeAfterCreate = await userDoChallenge.create(user);

				res.status(201).json({
					code: "SUCCESS",
					msg: "start challenge success",
					data: userDoChallengeAfterCreate,
				});
			}
		}
	} else {
		res.status(400).json({ code: "ERROR", msg: "Challenge Invalid" });
	}
};

const getDoingById = async (req, res, next) => {
	const { id } = req.params;
	const { userId } = req.user;

	try {
		const challengeDoing = await userDoChallenge.findOne({ user: userId, challenge: id });

		res.status(200).json(challengeDoing);

		// .populate("comments").populate("author", "userName");
	} catch (error) {
		console.log(error);
		res.status(400).json({ code: "INVALID", status: 404, msg: "Challenge not doing" });
	}
};

module.exports = {
	submitChallenge,
	startDoingChallenge,
	getDoingById,
	submitExerciseChallenge,
	submitExam,
};

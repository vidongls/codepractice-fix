const { exec, spawn, execFileSync, execSync } = require("child_process");
const fs = require("fs");
const util = require("util");
const mkdirp = require("mkdirp");

const ChallengeModel = require("../models/challengeModel");
const { rootPath } = require("../rootPath");
const path = require("path");

const compileCode = async (req, res) => {
	const { content, challengeId } = req.body;

	if (!challengeId) {
		res.status(404).json({ code: "VALIDATE", msg: { challengeId: "required" } });
	}

	if (!content) {
		res.status(404).json({ code: "VALIDATE", msg: { content: "required" } });
	}

	const challenge = await ChallengeModel.findById(challengeId);
	// const filePath = `compile/${req.user.userId + challengeId}.js`;

	await mkdirp("compile");

	const filePath = path.join(process.cwd(), "compile", `${req.user.userId + challengeId}.js`);

	const compileResult = await compileProcess(filePath, content, challenge);

	res.status(compileResult.code).json(compileResult.data);

	// fs.writeFile(filePath, formatContent, function (err) {
	// 	if (err) {
	// 		// 500 bad request
	// 		console.log(err);
	// 		res.status(500).json({
	// 			success: false,
	// 			code: "BAD_REQUEST",
	// 		});
	// 	}

	// 	fs.stat(filePath, async function (err, stats) {
	// 		if (err) {
	// 			// 500 bad request
	// 			res.status(500).json({
	// 				success: false,
	// 				code: "BAD_REQUEST",
	// 			});

	// 			fs.unlink(filePath, function (err) {
	// 				if (err) return console.log(err);
	// 				console.log("file deleted successfully");
	// 			});
	// 			return;
	// 		}

	// 		exec(`node ${filePath}`, (err, stdout, stderr) => {
	// 			if (err) {
	// 				res.status(200).json({
	// 					success: false,
	// 					data: stdout,
	// 					err: "ReferenceError" + err.message.split("ReferenceError")[1],
	// 				});

	// 				fs.unlink(filePath, function (err) {
	// 					if (err) return console.log(err);
	// 					console.log("file deleted successfully");
	// 				});
	// 				return;
	// 			}

	// 			if (!stdout) {
	// 				res.status(200).json({
	// 					success: false,
	// 					code: "ERROR",
	// 					data: "~ no response on stdout ~",
	// 					err: err.message,
	// 				});

	// 				fs.unlink(filePath, function (err) {
	// 					if (err) return console.log(err);
	// 					console.log("file deleted successfully");
	// 				});
	// 				return;
	// 			}

	// 			let result = [];

	// 			challenge.testCase.forEach((item, index) => {
	// 				stdout.split("\n").forEach((itemOutput, idx) => {
	// 					if (index === idx) {
	// 						result.push({
	// 							testCaseInput: item.input,
	// 							data: itemOutput,
	// 							expectedOutput: item.output,
	// 							status:
	// 								JSON.stringify(item.output.trim().toLowerCase()) ===
	// 								JSON.stringify(itemOutput.trim().toLowerCase()),
	// 						});
	// 					}
	// 				});
	// 			});

	// 			res.status(200).json({
	// 				success: true,
	// 				data: stdout,
	// 				result,
	// 			});

	// 			fs.unlink(filePath, function (err) {
	// 				if (err) return console.log(err);
	// 				console.log("file deleted successfully");
	// 			});
	// 		});
	// 	});
	// });
};

const compileProcess = async (filePath, content, challenge) => {
	let formatContent = content + ";";

	challenge.testCase.map((item) => {
		const formatInput = item.input.replace(/\r?\n|\r/, "");

		formatContent += `console.log(${challenge.functionName}(${formatInput}));` + "\n";
	});

	return new Promise(function (resolve, reject) {
		try {
			fs.writeFile(filePath, formatContent, function (err) {
				if (err) {
					console.log(err);

					resolve({
						code: 500,
						data: {
							success: false,
							err: "BAD_REQUEST",
							data: "",
							result: [],
							WRITE_ERR: err,
						},
					});
				}
				console.log("zppp");
				fs.stat(filePath, async function (err, stats) {
					if (err) {
						// 500 bad request

						resolve({
							code: 500,
							data: {
								success: false,
								err: "NO_FILE",
								data: "",
								result: [],
							},
						});
					}

					exec(`node ${filePath}`, (err, stdout, stderr) => {
						if (err) {
							console.log("🧙 ~ err", err);
							let newErr = "";
							if (err.message.includes("ReferenceError")) {
								newErr = "ReferenceError" + err.message.split("ReferenceError")[1].replace("backend-code-practice\\compile", "");
							}

							if (err.message.includes("SyntaxError")) {
								newErr = "SyntaxError" + err.message.split("SyntaxError")[1].replace("backend-code-practice\\compile", "");
							}
							fs.unlink(filePath, function (err) {
								if (err) return console.log("xoa_file1", err);
								console.log("file deleted successfully");
							});
							let result = [];
							challenge.testCase.forEach((item, index) => {
								stdout.split("\n").forEach((itemOutput, idx) => {
									if (index === idx) {
										result.push({
											testCaseInput: item.input,
											data: itemOutput,
											expectedOutput: item.output,
											status:
												JSON.stringify(item.output.trim().toLowerCase()) === JSON.stringify(itemOutput.trim().toLowerCase()),
										});
									}
								});
							});
							resolve({
								code: 200,
								data: {
									success: false,
									data: stdout,
									err: newErr,
									result,
								},
							});
						} else if (!stdout) {
							fs.unlink(filePath, function (err) {
								if (err) return console.log("xoa_file2", err);
								console.log("file deleted successfully");
							});
							resolve({
								code: 200,
								data: {
									success: false,
									data: "~ no response on stdout ~",
									err: err.message,
									result: [],
								},
							});
						} else {
							let result = [];

							challenge.testCase.forEach((item, index) => {
								stdout.split("\n").forEach((itemOutput, idx) => {
									if (index === idx) {
										result.push({
											testCaseInput: item.input,
											data: itemOutput,
											expectedOutput: item.output,
											status:
												JSON.stringify(item.output.trim().toLowerCase()) === JSON.stringify(itemOutput.trim().toLowerCase()),
										});
									}
								});
							});

							fs.unlink(filePath, function (err) {
								if (err) return console.log("xoa_file3", err);
								console.log("file deleted successfully");
							});

							resolve({
								code: 200,
								data: {
									success: true,
									data: stdout,
									result,
									err: "",
								},
							});
						}
					});
				});
			});
		} catch (error) {
			console.log("🧙 ~ error", error);
			reject(error);
		}
	});
};

module.exports = {
	compileCode,
	compileProcess,
};

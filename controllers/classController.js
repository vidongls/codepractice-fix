const { mapKeys, isEmpty, map, forEach, find, findKey, mapValues, keys } = require("lodash");
const ClassModel = require("../models/classModel");
const UserModel = require("../models/usersModel");
const { fireGetOne } = require("../services/firebaseUntil");
const { generateId } = require("../utils/helper");
const { async } = require("@firebase/util");

const createClass = async (req, res) => {
	const { name } = req.body;

	const code = "CS" + generateId();

	try {
		const classModel = await ClassModel.create({
			authorId: req.user.userId,
			name,
			code,
		});

		await classModel.save();

		res.status(201).json({
			code: "SUCCESS",
			msg: "Create class success",
			data: classModel,
		});
	} catch (error) {
		res.status(400).send(error);
		throw new Error("Create class error");
	}
};

const updateClass = async (req, res, next) => {
	const { name } = req.body;
	const { id } = req.params;

	try {
		const updateClassData = await ClassModel.findByIdAndUpdate(id, { name }, { new: true });

		res.status(201).json({ code: "SUCCESS", msg: "Update class success", data: updateClassData });
	} catch (error) {
		console.log("🧙 ~ error", error);
		res.status(400).json(error);
	}
};

const removeClass = async (req, res) => {
	try {
		const classData = await ClassModel.findByIdAndRemove(req.params.id);
		res.status(201).json({ code: "SUCCESS", msg: "Remove class success" });
	} catch (error) {
		console.log("🧙 ~ error", error);
		res.status(404).json(error);
	}
};

const getAllClass = async (req, res, next) => {
	const classModel = await ClassModel.find({}).sort({ createdAt: -1 }).populate("students").populate("authorId");

	res.status(200).json({ data: classModel });
};

const getById = async (req, res, next) => {
	const { id } = req.params;

	try {
		const classModel = await ClassModel.findById(id).populate("students");

		// .populate("comments").populate("author", "userName");
		res.status(200).json({ data: classModel });
	} catch (error) {
		res.status(400).json(error);
	}

	// res.status(200).json({ data: classModel });
};

const getClassByAuthor = async (req, res, next) => {
	const keyword = req.query
		? {
				...req.query,
				authorId: req.user.userId,
		  }
		: {};
	const classModel = await ClassModel.find({ ...keyword })
		.populate("students")
		.sort({ createdAt: -1 });
	res.status(200).json({ data: classModel });
};

const addUserToClass = async (req, res) => {
	const { student } = req.body;

	if (!student) {
		res.status(400).json({ code: "INVALID", msg: "Student Invalid!" });
	}

	try {
		await UserModel.updateMany({ _id: { $in: student } }, { $addToSet: { classes: req.params.id } });

		const classModel = await ClassModel.findOneAndUpdate(
			{
				_id: req.params.id,
			},
			{ $addToSet: { students: student } }
		);

		await classModel.save();

		res.status(201).json({
			code: "SUCCESS",
			msg: "Create class success",
			data: classModel,
		});
	} catch (error) {
		res.status(400).send(error);

		// throw new Error("Create class error");
	}
};

const removeUserFromClass = async (req, res) => {
	const { student } = req.body;

	try {
		await UserModel.updateMany({ _id: { $in: student } }, { $pull: { classes: req.params.id } });

		const classModel = await ClassModel.findOneAndUpdate(
			{
				_id: req.params.id,
			},
			{ $pull: { students: student } }
		);
		if (classModel) {
			// await challenge.remove();

			res.status(201).json({ code: "SUCCESS", msg: "Add student success", data: classModel });
		} else {
			res.status(404);
			throw new Error("Add student failed");
		}
	} catch (error) {
		res.status(404).json(error);
	}
};

const getAllExamDoing = async (req, res) => {
	const { userId } = req.user;

	try {
		fireGetOne(`classes`).then(async (data) => {
			if (data) {
				const classIds = [];
				const students = [];
				mapKeys(data, async function (value, key) {
					classIds.push(key);
					if (!isEmpty(value?.students)) {
						students.push(value.students);
					}
				});
				const studentIds = map(students, "id");
				const classData = await ClassModel.find({ _id: { $in: classIds }, authorId: userId })
					.populate("students", "-password")
					.populate("authorId", "firstName lastName avatar");
				const newClassData = map(classData, (item) => {
					const newDataStudent = map(item.students, (val) => {
						return {
							data: val,
							status: studentIds.includes(val._id) ? "INPROGRESS" : "NEW",
						};
					});

					return { data: item, students: newDataStudent };
				});
				res.status(200).json({ data: newClassData });
				// console.log("object", listData);
			} else {
				res.status(200).json({ data: [] });
			}
		});
		// .populate("comments").populate("author", "userName");
	} catch (error) {
		console.log("🧙 ~ error", error);
		res.status(400).json({ error });
	}
};

const getOneExamDoing = async (req, res) => {
	const { classId } = req.query;
	const { userId } = req.user;

	try {
		fireGetOne(`classes/${classId}`).then(async (data) => {
			if (data) {
				const dataStarted = find(data, "started");
				const dataStartedKeys = findKey(data, "started");
				fireGetOne(`classes/${classId}/${dataStartedKeys}`).then(async (dataChallenge) => {
					const studentIds = keys(dataChallenge?.students);

					const classData = await ClassModel.findById(classId)
						.populate("students", "-password")
						.populate("authorId", "firstName lastName avatar");

					const newDataStudent = map(classData.students, (val) => {
						const newDataStudentFire = find(dataChallenge?.students, { id: val._id.toString() });
						return {
							data: val,
							status: newDataStudentFire?.id === val._id.toString() ? newDataStudentFire?.status : "NEW",
						};
					});

					res.status(200).json({ students: newDataStudent, challenge: dataStartedKeys.split("-")[1], classes: classData });
				});

				// console.log("object", listData);
			} else {
				res.status(200).json({ data: [] });
			}
		});
		// .populate("comments").populate("author", "userName");
	} catch (error) {
		console.log("🧙 ~ error", error);
		res.status(400).json({ error });
	}
};

const getStudentsInfo = async (req, res) => {
	const { studentId } = req.query;

	try {
		const dataUser = await UserModel.findById(studentId).select("firstName lastName code");

		// .populate("comments").populate("author", "userName");
		if (dataUser) {
			res.status(200).json({ student: dataUser });
		} else {
			res.status(404).json({ error: "invalid students" });
		}
	} catch (error) {
		console.log("🧙 ~ error", error);
		res.status(400).json({ error });
	}
};

module.exports = {
	createClass,
	addUserToClass,
	removeUserFromClass,
	getAllClass,
	getClassByAuthor,
	getById,
	updateClass,
	removeClass,
	getAllExamDoing,
	getOneExamDoing,
	getStudentsInfo,
};

// 50%
